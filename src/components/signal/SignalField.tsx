"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CUBE_CX, CUBE_CY, CUBE_H, cubeGoal, iconSample, quatDot, quatToMat, slerpQuat, type Quat } from "./cube";
import { buildSeeds, latticeSize } from "./formations";
import { fragmentShader, vertexShader } from "./shader";
import { CONFIDENT_SETTLE, FLOW_DAMPING, FLOW_STIFFNESS, ORGANIC_FLOW } from "./flow";
import { setMouse, signal } from "./store";
import {
  MOBILE_FIT,
  POINT_BUDGET,
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
  type DeviceTier,
} from "@/lib/env";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedMotionServerSnapshot() {
  return false;
}

const cubeMatrix = new THREE.Matrix3();
const cubeQuat: Quat = [0, 0, 0, 1];
let cubeQuatLive = false;
let cubeLatch = -1;
let focusGone = 0;
/** 1 while a face is held, so the camera can sit on that face's axis. */
let faceAlign = 0;

const BASE_COLOR = new THREE.Color("#4f86b4");
const ACCENT_COLOR = new THREE.Color("#f5b700");
const DETECT_COLOR = new THREE.Color("#ff3b2e");
function Points({
  count,
  still,
  lite,
  mobile,
}: {
  count: number;
  still: boolean;
  lite: boolean;
  mobile: boolean;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { invalidate } = useThree();

  const geometry = useMemo(() => {
    const seeds = buildSeeds(count);
    const position = new Float32Array(count * 3);
    const aUV = new Float32Array(count * 2);
    const aRand = new Float32Array(count);
    const aGold = new Float32Array(count);
    const aIcon = new Float32Array(count * 2);

    seeds.forEach((s, i) => {
      position[i * 3] = s.seed[0];
      position[i * 3 + 1] = s.seed[1];
      position[i * 3 + 2] = s.seed[2];
      aUV[i * 2] = s.u;
      aUV[i * 2 + 1] = s.v;
      aRand[i] = s.rand;
      aGold[i] = s.gold;
      const face = Math.min(5, Math.floor(s.rand * 6));
      const extra = s.rand * 6 - face;
      const [ix, iy] = iconSample(face, s.seed[0], s.seed[1], extra);
      aIcon[i * 2] = ix;
      aIcon[i * 2 + 1] = iy;
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("aUV", new THREE.BufferAttribute(aUV, 2));
    g.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
    g.setAttribute("aGold", new THREE.BufferAttribute(aGold, 1));
    g.setAttribute("aIcon", new THREE.BufferAttribute(aIcon, 2));
    return g;
  }, [count]);

  const uniforms = useMemo(() => {
    const { cols, rows } = latticeSize(count);
    return {
      uTime: { value: 0 },
      uPhase: { value: signal.rendered },
      uPhaseVel: { value: 0 },
      uPhaseTarget: { value: signal.phase },
      uFlow: { value: ORGANIC_FLOW ? 1 : 0 },
      uSettle: { value: ORGANIC_FLOW && CONFIDENT_SETTLE ? 1 : 0 },
      uIntensity: { value: signal.intensity },
      uResolve: { value: signal.resolve },
      uPixelRatio: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uFieldGlow: { value: 1 },
      uFocus: { value: -1 },
      uFocusAge: { value: 0 },
      uZoom: { value: 0 },
      uZoomOn: { value: 0 },
      uIconSpin: { value: 0 },
      uScene: { value: 0 },
      uSceneMix: { value: 0 },
      uCloud: { value: 0 },
      uCover: { value: 0 },
      uHandoff: { value: 0 },
      uLite: { value: lite ? 1 : 0 },
      uMobile: { value: mobile ? 1 : 0 },
      uCols: { value: cols },
      uRows: { value: rows },
      uCube: { value: cubeMatrix },
      uBase: { value: BASE_COLOR },
      uAccent: { value: ACCENT_COLOR },
      uDetect: { value: DETECT_COLOR },
    };
  }, [lite, mobile, count]);

  useEffect(() => {
    signal.invalidate = invalidate;
    return () => {
      signal.invalidate = null;
    };
  }, [invalidate]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    // Ease toward the target so a fast scroll does not snap the field.
    // ORGANIC_FLOW swaps that exponential for a spring. Set the flag false
    // in ./flow.ts to put this block back to the single lerp.
    const dt = Math.min(delta, 0.05);
    const step = still ? 1 : 1 - Math.pow(0.0015, dt);
    if (still || !ORGANIC_FLOW) {
      signal.rendered += (signal.phase - signal.rendered) * step;
      signal.phaseVel = 0;
      if (Math.abs(signal.phase - signal.rendered) < 0.0005) {
        signal.rendered = signal.phase;
      }
    } else {
      signal.phaseVel += (signal.phase - signal.rendered) * FLOW_STIFFNESS * dt;
      signal.phaseVel *= Math.exp(-FLOW_DAMPING * dt);
      signal.rendered += signal.phaseVel * dt;
      if (
        Math.abs(signal.phase - signal.rendered) < 0.0004 &&
        Math.abs(signal.phaseVel) < 0.002
      ) {
        signal.rendered = signal.phase;
        signal.phaseVel = 0;
      }
    }

    signal.mouseRX = signal.mouseX;
    signal.mouseRY = signal.mouseY;

    // Phones always show the unmanaged cloud. Desktop keeps the chapter,
    // including the zoom into one industry.
    u.uPhase.value = mobile ? 0 : signal.rendered;
    u.uPhaseVel.value = mobile ? 0 : signal.phaseVel;
    u.uPhaseTarget.value = mobile ? 0 : signal.phase;
    u.uFlow.value = ORGANIC_FLOW && !still ? 1 : 0;
    u.uSettle.value = ORGANIC_FLOW && CONFIDENT_SETTLE && !still ? 1 : 0;
    u.uIntensity.value = signal.intensity;
    u.uResolve.value = signal.resolve;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    const sceneTarget = signal.scene >= 0 ? 1 : 0;
    signal.sceneMix += (sceneTarget - signal.sceneMix) * step;
    if (Math.abs(sceneTarget - signal.sceneMix) < 0.0005) {
      signal.sceneMix = sceneTarget;
    }
    const cloudStep = still ? 1 : 1 - Math.pow(0.04, dt);
    signal.cloudR += (signal.cloud - signal.cloudR) * cloudStep;
    if (Math.abs(signal.cloud - signal.cloudR) < 0.0005) signal.cloudR = signal.cloud;
    u.uCloud.value = mobile ? 0 : signal.cloudR;
    // Same frame the zoom crosses into black. A later rAF is a frame too late,
    // and that frame is the flash of the icon and the die.
    if (!mobile && signal.zoom > 0.5 && signal.zoomR > 0.74) {
      signal.cover = 1;
    }
    u.uCover.value = mobile ? 0 : signal.cover;
    u.uHandoff.value = mobile ? 0 : signal.handoff;
    signal.focusAge = still ? 8 : Math.min(8, signal.focusAge + delta);
    if (!still && signal.zoomR > 0) signal.iconSpin += 0.35 * signal.zoomR * delta;

    u.uFocus.value = signal.focus;
    u.uFocusAge.value = signal.focusAge;
    u.uScene.value = signal.sceneShown;
    u.uSceneMix.value = mobile ? 0 : signal.sceneMix;
    u.uZoom.value = mobile ? 0 : signal.zoomR;
    u.uZoomOn.value = !mobile && signal.zoom > 0.02 ? 1 : 0;
    u.uIconSpin.value = signal.iconSpin;

    const pointer = u.uPointer.value as THREE.Vector2;
    if (mobile) {
      const t = state.clock.elapsedTime;
      pointer.set(Math.sin(t * 0.55) * 0.62, Math.sin(t * 0.37 + 1.4) * 0.42);
      u.uFieldGlow.value = 1;
    } else {
      pointer.set(signal.mouseRX, signal.mouseRY);
      u.uFieldGlow.value = signal.fieldGlow;
    }
    u.uAspect.value = state.size.width / Math.max(state.size.height, 1);

    if (!still) u.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig({
  still,
  mobile,
}: {
  still: boolean;
  lite: boolean;
  mobile: boolean;
}) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = still ? 0 : state.clock.elapsedTime;
    const onCube = !mobile && signal.rendered > 3.4 && signal.rendered < 4.6;
    const hovering = onCube && signal.focus >= 0 && signal.focus < 6;
    const pulling = signal.zoom > 0.02 || signal.zoomR > 0.03;
    if (hovering) {
      cubeLatch = signal.focus;
      focusGone = 0;
    } else if (!pulling) {
      focusGone += dt;
    } else {
      focusGone = 0;
    }
    // Keep the last face across the gap between names, and while the
    // camera is still on its way in or out.
    const holdFace = cubeLatch >= 0 && (hovering || pulling || focusGone < 0.2);
    const face = holdFace ? cubeLatch : -1;
    const goal = cubeGoal(t, face);
    if (!cubeQuatLive) {
      const spin = cubeGoal(t, -1);
      cubeQuat[0] = spin[0];
      cubeQuat[1] = spin[1];
      cubeQuat[2] = spin[2];
      cubeQuat[3] = spin[3];
      cubeQuatLive = true;
    }
    if (still) {
      cubeQuat[0] = goal[0];
      cubeQuat[1] = goal[1];
      cubeQuat[2] = goal[2];
      cubeQuat[3] = goal[3];
    } else {
      // Back to the tumble is slower than the turn onto a face. Copying
      // the spin while it is still degrees away is the snap on the way out.
      const rate = face < 0 ? 0.62 : 2.4;
      let frac = 1 - Math.exp(-rate * dt);
      const ang = 2 * Math.acos(Math.min(1, quatDot(cubeQuat, goal)));
      // Join the goal only once the leftover turn is under a pixel.
      if (ang * (1 - frac) < 0.004) frac = 1;
      const next = slerpQuat(cubeQuat, goal, frac);
      cubeQuat[0] = next[0];
      cubeQuat[1] = next[1];
      cubeQuat[2] = next[2];
      cubeQuat[3] = next[3];
    }
    if (!holdFace) cubeLatch = face;
    const m = quatToMat(cubeQuat);
    cubeMatrix.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);

    // The face is square before the camera moves. On the way out the
    // camera retreats first, and the tumble resumes after.
    const locked = still || (face >= 0 && quatDot(cubeQuat, goal) > 0.999);
    const zoomGoal = !mobile && signal.zoom > 0.5 && locked ? 1 : 0;
    const zoomStep = still ? 1 : 1 - Math.pow(0.42, dt);
    if (signal.zoom > 0.5) {
      // Only travel inward. Easing back out here draws the die again,
      // which is the flash before the unmanaged cloud.
      if (zoomGoal > signal.zoomR) {
        signal.zoomR += (zoomGoal - signal.zoomR) * zoomStep;
        if (zoomGoal - signal.zoomR < 0.0005) signal.zoomR = zoomGoal;
      }
      // The last stretch is already black. Finish it in this frame so the
      // hold starts on a still, fully black screen.
      if (signal.zoomR > 0.74) signal.zoomR = 1;
    } else if (signal.cover > 0.5 || signal.handoff > 0.5) {
      signal.zoomR = 0;
    } else {
      signal.zoomR += (zoomGoal - signal.zoomR) * zoomStep;
      if (Math.abs(zoomGoal - signal.zoomR) < 0.0005) signal.zoomR = zoomGoal;
    }

    const z = mobile ? 0 : signal.zoomR;
    const fit = mobile ? MOBILE_FIT : 1;
    // A selected face points at the viewer. The rest camera sits left of the
    // die, so slide onto the die's axis while it is held. Zoom then travels
    // straight through that face.
    const alignGoal = !mobile && face >= 0 ? 1 : 0;
    // Arrive on the face promptly. Leave it at the tumble's pace so the
    // die doesn't pop from head-on back to the angled spin.
    const alignRate = alignGoal > faceAlign ? 6.7 : 0.85;
    const alignStep = still ? 1 : 1 - Math.exp(-alignRate * dt);
    faceAlign += (alignGoal - faceAlign) * alignStep;
    if (Math.abs(alignGoal - faceAlign) < 0.0005) faceAlign = alignGoal;
    const along = Math.max(z, faceAlign);
    const restZ = mobile ? 24 : 20;
    const throughZ = -Math.max(0.85, CUBE_H * 0.35);
    const camX = CUBE_CX * along * fit;
    const camY = CUBE_CY * along * fit;
    const camZ = restZ + (throughZ - restZ) * z;
    state.camera.position.set(camX, camY, camZ);
    state.camera.lookAt(camX, camY, 0);
    // Keep the die in the gap beside the names. The lens shift does that
    // without turning the face.
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.updateProjectionMatrix();
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const tan = Math.tan((cam.fov * Math.PI) / 180 / 2);
    const wanted = CUBE_CX / (restZ * tan * aspect);
    const natural = camZ > 0.2 ? (CUBE_CX * fit - camX) / (camZ * tan * aspect) : 0;
    cam.projectionMatrix.elements[8] = -(wanted - natural);
  });
  return null;
}

export default function SignalField({ tier }: { tier: DeviceTier }) {
  const host = useRef<HTMLDivElement>(null);
  const still = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    reducedMotionServerSnapshot,
  );
  const [awake, setAwake] = useState(true);

  const mobile = tier === "mobile";

  useEffect(() => {
    if (still || mobile) return;
    const onMove = (event: PointerEvent) => {
      setMouse(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still, mobile]);

  // Stop the render loop entirely when the tab is hidden. A paused rAF is
  // the difference between a background tab costing nothing and costing a
  // GPU core.
  useEffect(() => {
    const onVisibility = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const count = POINT_BUDGET[tier];
  if (count === 0) return null;

  const lite = tier === "reduced";
  const frameloop = !awake ? "never" : still ? "demand" : "always";

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Canvas
        frameloop={frameloop}
        dpr={mobile ? [1, 3] : lite ? 1 : [1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: mobile ? "low-power" : "high-performance",
        }}
        camera={{ fov: 45, position: [0, 0, 20], near: 0.1, far: 100 }}
      >
        <CameraRig still={still} lite={lite} mobile={mobile} />
        <Points
          key={`${count}-${still ? "still" : "live"}-${lite ? "lite" : "full"}-${mobile ? "mobile" : "desk"}`}
          count={count}
          still={still}
          lite={lite}
          mobile={mobile}
        />
      </Canvas>
    </div>
  );
}
