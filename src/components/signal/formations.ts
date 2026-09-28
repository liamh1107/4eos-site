/**
 * The Operational Signal.
 *
 * One point field carries the whole narrative. It never decorates: each
 * formation is a claim about how a business technology environment changes
 * once somebody takes ownership of it.
 *
 * The formation maths lives twice — once here in TypeScript for the static
 * poster that mobile and no-WebGL clients get, and once in GLSL in
 * ./shader.ts for the live field. The two must stay in step; if you change a
 * formation, change both.
 */

export const PHASES = [
  "unmanaged",
  "discovery",
  "ownership",
  "security",
  "industries",
  "response",
  "strategy",
] as const;

export type Phase = (typeof PHASES)[number];

export const PHASE_INDEX = Object.fromEntries(
  PHASES.map((p, i) => [p, i]),
) as Record<Phase, number>;

export const MAX_PHASE = PHASES.length - 1;

/** What each formation is saying, for the poster's accessible description. */
export const PHASE_CAPTION: Record<Phase, string> = {
  unmanaged: "An unstructured field of drifting, unmonitored endpoints.",
  discovery: "The same endpoints resolved onto a regular lattice.",
  ownership: "The lattice organised into three concentric tiers of coverage.",
  security: "A perimeter closed around the environment.",
  industries:
    "Six industry marks — scales, umbrella, cross, crane, gear, and rising bars — each ringed by its own field.",
  response: "A pulse travelling out from the centre and back.",
  strategy: "The field leaning forward onto a receding horizon.",
};

const TAU = Math.PI * 2;

/** Polar layout of the six industry clusters. Keep in step with the GLSL. */
export const CLUSTER_RX = 9.5;
export const CLUSTER_RY = 4.7;

export function clusterCenter(k: number): [number, number] {
  const a = (k / 6) * TAU;
  return [Math.cos(a) * CLUSTER_RX, Math.sin(a) * CLUSTER_RY];
}

/**
 * Industry marks. Keep every constant in step with `glyph()` in shader.ts.
 * `seed.z < ICON_CUT` builds the mark; the rest is the surrounding field.
 * `extra` is fract(rand * 6), a third uniform that is not seed.z (seed.z is
 * the role split and is biased once the cut is applied).
 */
const ICON_CUT = 0.34;
/** Mark size inside the cloud. Small enough that the object reads as a speck. */
const MARK_SCALE = 0.22;
/** Outer radius of the industry cloud. Keep in step with the GLSL halo. */
const SPHERE_OUTER = 2.5;

function fract(n: number) {
  return n - Math.floor(n);
}

function hash21(x: number, y: number) {
  const n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

function tube(a: Vec3, b: Vec3, along: number, ang: number, rad: number): Vec3 {
  const dir: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const t = Math.min(1, Math.max(0, along));
  const p: Vec3 = [a[0] + dir[0] * t, a[1] + dir[1] * t, a[2] + dir[2] * t];
  const dlen = Math.hypot(dir[0], dir[1], dir[2]);
  const nDir: Vec3 =
    dlen > 1e-4
      ? [dir[0] / dlen, dir[1] / dlen, dir[2] / dlen]
      : [0, 1, 0];
  const up: Vec3 = Math.abs(nDir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const side: Vec3 = [
    nDir[1] * up[2] - nDir[2] * up[1],
    nDir[2] * up[0] - nDir[0] * up[2],
    nDir[0] * up[1] - nDir[1] * up[0],
  ];
  const sl = Math.hypot(side[0], side[1], side[2]) || 1;
  side[0] /= sl;
  side[1] /= sl;
  side[2] /= sl;
  const bin: Vec3 = [
    nDir[1] * side[2] - nDir[2] * side[1],
    nDir[2] * side[0] - nDir[0] * side[2],
    nDir[0] * side[1] - nDir[1] * side[0],
  ];
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [
    p[0] + (side[0] * c + bin[0] * s) * rad,
    p[1] + (side[1] * c + bin[1] * s) * rad,
    p[2] + (side[2] * c + bin[2] * s) * rad,
  ];
}

/** Hemispherical bowl, opening upward. `phi` 0 is the rim, π/2 is the bottom. */
function bowl(cx: number, rimY: number, along: number, ang: number, fill: number): Vec3 {
  const phi = along * (Math.PI / 2);
  const shell = 0.32 + fill * 0.12;
  const horiz = Math.cos(phi) * shell;
  return [
    cx + Math.cos(ang) * horiz,
    rimY - Math.sin(phi) * shell,
    Math.sin(ang) * horiz,
  ];
}

/** Local offset of one orb inside an industry mark. */
function industryGlyph(k: number, seed: Vec3, extra: number): Vec3 {
  const along = seed[0];
  const ang = seed[1] * TAU;
  const fill = Math.sqrt(hash21(seed[0], seed[1]));

  if (k === 0) {
    // Legal — a standing balance. Foot, post, beam, hangers, two bowls.
    if (extra < 0.1) return tube([0, -1.08, 0], [0, -0.9, 0], along, ang, 0.1 + fill * 0.22);
    if (extra < 0.3) return tube([0, -0.9, 0], [0, 0.5, 0], along, ang, fill * 0.13);
    if (extra < 0.48) return tube([-0.92, 0.5, 0], [0.92, 0.5, 0], along, ang, fill * 0.11);
    if (extra < 0.55) return tube([-0.66, 0.5, 0], [-0.66, 0.02, 0], along, ang, fill * 0.05);
    if (extra < 0.62) return tube([0.66, 0.5, 0], [0.66, 0.02, 0], along, ang, fill * 0.05);
    return bowl(extra < 0.81 ? -0.66 : 0.66, 0.0, along, ang, fill);
  }

  if (k === 1) {
    // Insurance — a dome, a shaft, and a cane crook. The crook leaves
    // the shaft to the right and the tip comes back up.
    if (extra < 0.55) {
      const phi = along * (Math.PI / 2);
      const shell = 0.86 + fill * 0.14;
      const horiz = Math.sin(phi) * shell;
      return [Math.cos(ang) * horiz, Math.cos(phi) * shell * 0.88 + 0.12, Math.sin(ang) * horiz];
    }
    if (extra < 0.76) return tube([0, 0.55, 0], [0, -0.92, 0], along, ang, fill * 0.09);
    const sweep = Math.PI * 1.2;
    const a = along * sweep;
    const crook = 0.36;
    const hx = (1 - Math.cos(a)) * crook;
    const hy = -0.92 - Math.sin(a) * crook;
    const thick = 0.045 + fill * 0.04;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [hx + Math.cos(a) * c * thick, hy + Math.sin(a) * c * thick, s * thick];
  }

  if (k === 2) {
    // Healthcare — two round bars. Vertical arms stop at the bar
    // so the centre is not sampled twice.
    const rad = 0.16 + fill * 0.18;
    if (extra < 0.5) return tube([-0.95, 0, 0], [0.95, 0, 0], along, ang, rad);
    if (along < 0.5) return tube([0, -0.95, 0], [0, -0.32, 0], along * 2, ang, rad);
    return tube([0, 0.32, 0], [0, 0.95, 0], (along - 0.5) * 2, ang, rad);
  }

  if (k === 3) {
    // Construction — solid mast and jib, thin cable, a small hook.
    if (extra < 0.32) return tube([-0.52, -1.02, 0], [-0.52, 0.92, 0], along, ang, 0.08 + fill * 0.14);
    if (extra < 0.6) return tube([-0.52, 0.84, 0], [1.05, 0.64, 0], along, ang, 0.06 + fill * 0.12);
    if (extra < 0.72) return tube([-0.52, 0.84, 0], [-1.02, 0.72, 0], along, ang, 0.06 + fill * 0.12);
    if (extra < 0.9) return tube([0.7, 0.7, 0], [0.7, -0.05, 0], along, ang, fill * 0.05);
    const rr = fill * 0.14;
    return [0.7 + Math.cos(ang) * rr, -0.16 - Math.abs(Math.sin(ang)) * rr, (hash21(along, extra) - 0.5) * 0.16];
  }

  if (k === 4) {
    // Manufacturing — a thick gear, not a flat washer.
    const z = (hash21(seed[0], extra) - 0.5) * 0.62;
    if (extra < 0.52) {
      const a = along * TAU;
      const r = 0.4 + fill * 0.3;
      return [Math.cos(a) * r, Math.sin(a) * r, z];
    }
    const tooth = Math.min(7, Math.floor(along * 8));
    const a = ((tooth + 0.5) / 8) * TAU;
    const r = 0.68 + fract(along * 8) * 0.4;
    const w = (hash21(extra, seed[1]) - 0.5) * 0.28;
    return [Math.cos(a) * r - Math.sin(a) * w, Math.sin(a) * r + Math.cos(a) * w, z];
  }

  // Private equity — three rising boxes.
  const bar = Math.min(2, Math.floor(extra * 3));
  const h = 0.62 + bar * 0.48;
  const jx = (hash21(seed[0], extra) - 0.5) * 0.38;
  const jz = (hash21(seed[1], extra) - 0.5) * 0.55;
  return [(bar - 1) * 0.78 + jx, -0.72 + along * h, jz];
}

/**
 * Spherical cloud around the mark. Radius is biased inward (exponent above
 * 1/3) so the middle is dense and the rim is a sparse dusting.
 */
function industryHalo(seed: Vec3): Vec3 {
  const hz = (seed[2] - ICON_CUT) / (1 - ICON_CUT);
  const az = seed[0] * TAU;
  const cosP = hz * 2 - 1;
  const sinP = Math.sqrt(Math.max(0, 1 - cosP * cosP));
  const R = SPHERE_OUTER * Math.pow(seed[1], 0.72);
  return [Math.cos(az) * sinP * R, cosP * R, Math.sin(az) * sinP * R];
}

export type Vec3 = [number, number, number];

/** Deterministic PRNG so the poster and the live field agree. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PointSeed = {
  /** Three independent randoms, used for volume placement and jitter. */
  seed: Vec3;
  /** Lattice coordinates in [0,1]. */
  u: number;
  v: number;
  /** One more random, used for tier, cluster and ring membership. */
  rand: number;
  /** Accent membership, kept independent of `rand` so the accent does not
   *  correlate with cluster or tier selection. */
  gold: number;
};

export function buildSeeds(count: number, seedValue = 0x4e05): PointSeed[] {
  const rnd = mulberry32(seedValue);
  // Lattice proportioned to the widescreen framing of the discovery state.
  const cols = Math.max(2, Math.round(Math.sqrt((count * 26) / 14)));
  const rows = Math.max(2, Math.ceil(count / cols));
  const out: PointSeed[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      seed: [rnd(), rnd(), rnd()],
      u: (i % cols) / (cols - 1),
      v: Math.floor(i / cols) / (rows - 1),
      rand: rnd(),
      gold: rnd(),
    });
  }
  return out;
}

/**
 * Position of one point in one formation. Mirrors `formation()` in the
 * vertex shader. `t` is elapsed seconds; pass 0 for a still frame.
 */
export function formation(phase: number, p: PointSeed, t = 0): Vec3 {
  const { seed, u, v, rand } = p;

  switch (phase) {
    case 0: {
      // Unmanaged: an unstructured cloud with slow, aimless drift.
      return [
        (seed[0] - 0.5) * 30 + Math.sin(t * 0.18 + seed[1] * TAU) * 0.9,
        (seed[1] - 0.5) * 17 + Math.cos(t * 0.15 + seed[2] * TAU) * 0.7,
        (seed[2] - 0.5) * 12,
      ];
    }
    case 1: {
      // Discovery: the cloud resolves onto a regular lattice.
      return [
        (u - 0.5) * 26,
        (v - 0.5) * 13.6,
        Math.sin(u * 7 + t * 0.35) * 0.55,
      ];
    }
    case 2: {
      // Ownership: three concentric tiers — Base, Pro, Premium.
      const tier = Math.floor(rand * 3);
      const r = 2.2 + tier * 1.75 + (seed[2] - 0.5) * 0.3;
      const a = u * TAU + tier * 0.6 + t * (0.05 + tier * 0.02);
      return [Math.cos(a) * r * 1.8, Math.sin(a) * r, (seed[0] - 0.5) * 0.8];
    }
    case 3: {
      // Security: a perimeter closes around the interior.
      const onRing = rand >= 0.3;
      const a = u * TAU + t * 0.06;
      const r = onRing
        ? 6.4 + (seed[1] - 0.5) * 0.28
        : Math.sqrt(seed[0]) * 5.9;
      return [Math.cos(a) * r * 1.8, Math.sin(a) * r, (seed[2] - 0.5) * 0.7];
    }
    case 4: {
      // Industries: six marks (scales, umbrella, cross, crane, gear, bars),
      // each surrounded by its own field. The live shader yaws a focused
      // mark while zoomed; the still pose here is the unzoomed one.
      const k = Math.min(5, Math.floor(rand * 6));
      const a = (k / 6) * TAU;
      const extra = fract(rand * 6);
      const mark = industryGlyph(k, seed, extra);
      const local =
        seed[2] < ICON_CUT
          ? ([mark[0] * MARK_SCALE, mark[1] * MARK_SCALE, mark[2] * MARK_SCALE] as Vec3)
          : industryHalo(seed);
      return [
        Math.cos(a) * CLUSTER_RX + local[0],
        Math.sin(a) * CLUSTER_RY + local[1],
        local[2],
      ];
    }
    case 5: {
      // Response: radial spokes carrying a travelling pulse.
      const spokes = 28;
      const a = (Math.floor(v * spokes) / spokes) * TAU;
      const rad = 1.5 + Math.pow(u, 0.85) * 6.6;
      return [Math.cos(a) * rad * 1.7, Math.sin(a) * rad, (seed[2] - 0.5) * 0.5];
    }
    default: {
      // Strategy: the field leans forward onto a receding horizon.
      const depth = v;
      return [
        (u - 0.5) * 34 * (0.3 + depth * 0.95),
        -4.2 + depth * 6.4,
        -depth * 13,
      ];
    }
  }
}
