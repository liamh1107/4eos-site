"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceTier } from "@/lib/env";

/**
 * SecureAI centerpiece: a slowly turning lattice of models inside a glass
 * cube. The cube is the perimeter. The lattice is the work going on inside
 * it. Nothing leaves the box.
 *
 * Raw three through the fiber reconciler, like the field. Points and line
 * segments only, so the whole thing is two draw calls plus the glass.
 */

const BASE = new THREE.Color("#4f86b4");
const GOLD = new THREE.Color("#f5b700");
const HALF = 1.25;
const LATTICE_RADIUS = 1.08;

type Budget = { nodes: number; edges: number };
const BUDGET: Record<DeviceTier, Budget> = {
  full: { nodes: 96, edges: 140 },
  reduced: { nodes: 80, edges: 112 },
  mobile: { nodes: 64, edges: 88 },
  none: { nodes: 0, edges: 0 },
};

/** Deterministic, so the picture is the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLattice({ nodes, edges }: Budget) {
  const rand = rng(40_31);
  const pos = new Float32Array(nodes * 3);
  const seed = new Float32Array(nodes);
  const hot = new Float32Array(nodes);
  const size = new Float32Array(nodes);

  for (let i = 0; i < nodes; i++) {
    // Even through the volume, pulled a little toward the shell so the
    // silhouette reads as a sphere turning inside a box.
    const u = rand();
    const r = LATTICE_RADIUS * Math.pow(0.18 + 0.82 * u, 0.42);
    const theta = rand() * Math.PI * 2;
    const z = rand() * 2 - 1;
    const s = Math.sqrt(1 - z * z);
    pos[i * 3] = r * s * Math.cos(theta);
    pos[i * 3 + 1] = r * z;
    pos[i * 3 + 2] = r * s * Math.sin(theta);
    seed[i] = rand();
    hot[i] = rand() < 0.14 ? 1 : 0;
    size[i] = 3.4 + rand() * 2.2 + hot[i] * 2.4;
  }

  // Each node reaches its nearest neighbours. The pass count grows until
  // the edge budget is spent, so the graph stays connected and even.
  const keys = new Set<string>();
  const pairs: [number, number][] = [];
  const near: number[][] = [];
  for (let i = 0; i < nodes; i++) {
    const order = [];
    for (let j = 0; j < nodes; j++) {
      if (j === i) continue;
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      order.push([dx * dx + dy * dy + dz * dz, j]);
    }
    order.sort((a, b) => a[0] - b[0]);
    near.push(order.slice(0, 5).map((o) => o[1]));
  }
  for (let k = 0; k < 5 && pairs.length < edges; k++) {
    for (let i = 0; i < nodes && pairs.length < edges; i++) {
      const j = near[i][k];
      if (j === undefined) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (keys.has(key)) continue;
      keys.add(key);
      pairs.push([i, j]);
    }
  }

  const linePos = new Float32Array(pairs.length * 6);
  const lineT = new Float32Array(pairs.length * 2);
  const lineSeed = new Float32Array(pairs.length * 2);
  const lineHot = new Float32Array(pairs.length * 2);
  pairs.forEach(([a, b], n) => {
    linePos.set(pos.subarray(a * 3, a * 3 + 3), n * 6);
    linePos.set(pos.subarray(b * 3, b * 3 + 3), n * 6 + 3);
    lineT[n * 2] = 0;
    lineT[n * 2 + 1] = 1;
    const s = rand();
    lineSeed[n * 2] = s;
    lineSeed[n * 2 + 1] = s;
    const h = Math.max(hot[a], hot[b]);
    lineHot[n * 2] = h;
    lineHot[n * 2 + 1] = h;
  });

  const points = new THREE.BufferGeometry();
  points.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  points.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  points.setAttribute("aHot", new THREE.BufferAttribute(hot, 1));
  points.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lines.setAttribute("aT", new THREE.BufferAttribute(lineT, 1));
  lines.setAttribute("aSeed", new THREE.BufferAttribute(lineSeed, 1));
  lines.setAttribute("aHot", new THREE.BufferAttribute(lineHot, 1));

  return { points, lines };
}

const NODE_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aHot;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vHot;
  varying float vPulse;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + aSeed * 6.2831);
    vHot = aHot;
    vPulse = pulse;
    gl_PointSize = aSize * (1.0 + 0.35 * pulse * aHot) * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const NODE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uBase;
  uniform vec3 uGold;
  varying float vHot;
  varying float vPulse;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.1, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.3;
    vec3 col = mix(uBase * 1.25, uGold, vHot);
    float a = (core + halo) * (0.6 + 0.4 * vPulse);
    gl_FragColor = vec4(col, a);
  }
`;

const EDGE_VERT = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  attribute float aHot;
  varying float vT;
  varying float vSeed;
  varying float vHot;
  void main() {
    vT = aT;
    vSeed = aSeed;
    vHot = aHot;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EDGE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uGold;
  varying float vT;
  varying float vSeed;
  varying float vHot;
  void main() {
    // One packet per edge, travelling end to end at its own pace.
    float head = fract(uTime * (0.16 + 0.22 * vSeed) + vSeed * 3.0);
    float pulse = smoothstep(0.22, 0.0, abs(vT - head));
    vec3 col = mix(uBase, uGold, pulse * (0.35 + 0.65 * vHot));
    float a = 0.18 + 0.55 * pulse;
    gl_FragColor = vec4(col, a);
  }
`;

const CORE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uGold;
  uniform vec3 uBase;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 2.4);
    gl_FragColor = vec4(mix(uBase, uGold, 0.55), a * 0.42);
  }
`;

const GLASS_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const GLASS_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uBase;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    // Faces are clear head-on and catch the light at a grazing angle.
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
    gl_FragColor = vec4(uBase * 0.85 + 0.15, 0.035 + 0.3 * f);
  }
`;

function buildAssets(tier: DeviceTier) {
  const lattice = buildLattice(BUDGET[tier]);
  const shaderUniforms = () => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uBase: { value: BASE },
    uGold: { value: GOLD },
  });
  const nodeMat = new THREE.ShaderMaterial({
    vertexShader: NODE_VERT,
    fragmentShader: NODE_FRAG,
    uniforms: shaderUniforms(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const edgeMat = new THREE.ShaderMaterial({
    vertexShader: EDGE_VERT,
    fragmentShader: EDGE_FRAG,
    uniforms: shaderUniforms(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const coreGeo = new THREE.BufferGeometry();
  coreGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
  coreGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array([0.5]), 1));
  coreGeo.setAttribute("aHot", new THREE.BufferAttribute(new Float32Array([1]), 1));
  coreGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([150]), 1));
  const coreMat = new THREE.ShaderMaterial({
    vertexShader: NODE_VERT,
    fragmentShader: CORE_FRAG,
    uniforms: shaderUniforms(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const box = new THREE.BoxGeometry(HALF * 2, HALF * 2, HALF * 2);
  const boxEdges = new THREE.EdgesGeometry(box);
  const glassMat = new THREE.ShaderMaterial({
    vertexShader: GLASS_VERT,
    fragmentShader: GLASS_FRAG,
    uniforms: { uBase: { value: BASE } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const frameMat = new THREE.LineBasicMaterial({ color: BASE, transparent: true, opacity: 0.7 });
  // Gold marks on the eight corners: the perimeter is the point.
  const corners = new Float32Array(8 * 3);
  let n = 0;
  for (const x of [-HALF, HALF]) for (const y of [-HALF, HALF]) for (const z of [-HALF, HALF]) {
    corners[n++] = x;
    corners[n++] = y;
    corners[n++] = z;
  }
  const cornerGeo = new THREE.BufferGeometry();
  cornerGeo.setAttribute("position", new THREE.BufferAttribute(corners, 3));
  cornerGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(8).fill(0.3), 1));
  cornerGeo.setAttribute("aHot", new THREE.BufferAttribute(new Float32Array(8).fill(1), 1));
  cornerGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(8).fill(3.2), 1));

  const all = [lattice.points, lattice.lines, nodeMat, edgeMat, coreGeo, coreMat, box, boxEdges, glassMat, frameMat, cornerGeo];
  return {
    lattice,
    nodeMat,
    edgeMat,
    coreGeo,
    coreMat,
    box,
    boxEdges,
    glassMat,
    frameMat,
    cornerGeo,
    dispose: () => all.forEach((item) => item.dispose()),
  };
}

function Scene({ tier, still }: { tier: DeviceTier; still: boolean }) {
  const latticeRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const coreRef = useRef<THREE.Points>(null);
  const { gl, invalidate } = useThree();
  const pointer = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const mobile = tier === "mobile";

  const assets = useMemo(() => buildAssets(tier), [tier]);
  useEffect(() => () => assets.dispose(), [assets]);

  // Desktop only: the cube leans a few degrees toward the pointer.
  useEffect(() => {
    if (mobile || still) return;
    const el = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((event.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((event.clientY - r.top) / r.height) * 2 - 1);
      invalidate();
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      invalidate();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, invalidate, mobile, still]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // A still frame holds a fixed pose with the pulses mid-flight.
    const t = still ? 7.3 : state.clock.elapsedTime;
    const pr = state.gl.getPixelRatio();
    const nodeU = (nodesRef.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;
    const edgeU = (edgesRef.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;
    const coreU = (coreRef.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;
    if (nodeU) {
      nodeU.uTime.value = t;
      nodeU.uPixelRatio.value = pr;
    }
    if (edgeU) edgeU.uTime.value = t;
    if (coreU) coreU.uPixelRatio.value = pr;

    const p = pointer.current;
    const ease = still ? 1 : 1 - Math.exp(-4 * dt);
    p.rx += (p.x - p.rx) * ease;
    p.ry += (p.y - p.ry) * ease;

    const lattice = latticeRef.current;
    if (lattice) {
      lattice.rotation.y = still ? 0.8 : t * 0.16;
      lattice.rotation.x = 0.28 + (still ? 0 : Math.sin(t * 0.21) * 0.08);
    }
    const shell = shellRef.current;
    if (shell) {
      shell.rotation.x = 0.46 - p.ry * 0.08;
      shell.rotation.y = -0.64 + p.rx * 0.12;
    }
  });

  return (
    <group ref={shellRef}>
      <group ref={latticeRef}>
        <points ref={coreRef} geometry={assets.coreGeo} material={assets.coreMat} renderOrder={0} />
        <lineSegments ref={edgesRef} geometry={assets.lattice.lines} material={assets.edgeMat} renderOrder={1} />
        <points ref={nodesRef} geometry={assets.lattice.points} material={assets.nodeMat} renderOrder={2} />
      </group>
      <mesh geometry={assets.box} material={assets.glassMat} renderOrder={3} />
      <lineSegments geometry={assets.boxEdges} material={assets.frameMat} renderOrder={4} />
      <points geometry={assets.cornerGeo} material={assets.nodeMat} renderOrder={5} />
    </group>
  );
}

export default function AiCore({
  tier,
  still,
  frameloop,
  onReady,
}: {
  tier: DeviceTier;
  still: boolean;
  frameloop: "always" | "demand" | "never";
  onReady?: () => void;
}) {
  const mobile = tier === "mobile";
  const lite = tier === "reduced";
  return (
    <Canvas
      frameloop={frameloop}
      dpr={mobile ? [1, 2] : lite ? 1 : [1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: mobile ? "low-power" : "high-performance",
      }}
      camera={{ fov: 32, position: [0, 0, 8.8], near: 0.1, far: 40 }}
      onCreated={() => onReady?.()}
    >
      <Scene key={tier} tier={tier} still={still} />
    </Canvas>
  );
}
