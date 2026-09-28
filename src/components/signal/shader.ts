/**
 * GLSL twin of the formation maths in ./formations.ts. Keep the two in step.
 *
 * `position` carries the per-point seed rather than a real position, because
 * every position is derived on the GPU. The mesh has frustum culling turned
 * off for the same reason.
 *
 * Formations are sized against the visible frustum: the camera sits at z=20
 * with a 45 degree field of view, so the viewport is 16.6 world units tall.
 * Anything meant to read as a whole shape stays inside roughly +/-7 in y.
 */

export const vertexShader = /* glsl */ `
#define TAU 6.28318530718

uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform float uResolve;
uniform float uPixelRatio;
uniform vec2 uMouse;
uniform float uGlowScale;
uniform float uFocus;
uniform float uZoom;
uniform float uLite;

attribute vec2 aUV;
attribute float aRand;
// Accent membership is its own random. Deriving it from aRand would tie the
// accent to whatever aRand also selects — every gold point would land in the
// same industry cluster and the same coverage tier.
attribute float aGold;

varying float vAlpha;
varying float vGold;
varying float vDetect;

float hash21(float x, float y) {
  float n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

vec3 tube(vec3 a, vec3 b, float along, float ang, float rad) {
  vec3 dir = b - a;
  float t = clamp(along, 0.0, 1.0);
  vec3 p = a + dir * t;
  float dlen = length(dir);
  vec3 nDir = dlen > 1e-4 ? dir / dlen : vec3(0.0, 1.0, 0.0);
  vec3 up = abs(nDir.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 side = cross(nDir, up);
  float sl = length(side);
  side = sl > 1e-4 ? side / sl : vec3(1.0, 0.0, 0.0);
  vec3 bin = cross(nDir, side);
  return p + (side * cos(ang) + bin * sin(ang)) * rad;
}

vec3 yaw(vec3 p, float spin) {
  float c = cos(spin);
  float s = sin(spin);
  return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

vec3 bowl(float cx, float rimY, float along, float ang, float fill) {
  float phi = along * 1.5707963;
  float shell = 0.32 + fill * 0.12;
  float horiz = cos(phi) * shell;
  return vec3(cx + cos(ang) * horiz, rimY - sin(phi) * shell, sin(ang) * horiz);
}

// Local orb inside an industry mark. Twin of industryGlyph() in formations.ts.
// One assignment and a final return — early returns leave ANGLE with an
// uninitialised function result (X4000) and the mark disappears.
vec3 glyph(float k, vec3 seed, float extra) {
  float along = seed.x;
  float ang = seed.y * TAU;
  float fill = sqrt(hash21(seed.x, seed.y));
  vec3 p = vec3(0.0);

  if (k < 0.5) {
    p = bowl(extra < 0.81 ? -0.66 : 0.66, 0.0, along, ang, fill);
    if (extra < 0.1) p = tube(vec3(0.0, -1.08, 0.0), vec3(0.0, -0.9, 0.0), along, ang, 0.1 + fill * 0.22);
    else if (extra < 0.3) p = tube(vec3(0.0, -0.9, 0.0), vec3(0.0, 0.5, 0.0), along, ang, fill * 0.13);
    else if (extra < 0.48) p = tube(vec3(-0.92, 0.5, 0.0), vec3(0.92, 0.5, 0.0), along, ang, fill * 0.11);
    else if (extra < 0.55) p = tube(vec3(-0.66, 0.5, 0.0), vec3(-0.66, 0.02, 0.0), along, ang, fill * 0.05);
    else if (extra < 0.62) p = tube(vec3(0.66, 0.5, 0.0), vec3(0.66, 0.02, 0.0), along, ang, fill * 0.05);
  } else if (k < 1.5) {
    float phi = along * 1.5707963;
    float shell = 0.86 + fill * 0.14;
    float horiz = sin(phi) * shell;
    p = vec3(cos(ang) * horiz, cos(phi) * shell * 0.88 + 0.12, sin(ang) * horiz);
    if (extra >= 0.76) {
      float sweep = 3.14159265 * 1.2;
      float a = along * sweep;
      float crook = 0.36;
      float hx = (1.0 - cos(a)) * crook;
      float hy = -0.92 - sin(a) * crook;
      float thick = 0.045 + fill * 0.04;
      float c = cos(ang);
      float s = sin(ang);
      p = vec3(hx + cos(a) * c * thick, hy + sin(a) * c * thick, s * thick);
    } else if (extra >= 0.55) {
      p = tube(vec3(0.0, 0.55, 0.0), vec3(0.0, -0.92, 0.0), along, ang, fill * 0.09);
    }
  } else if (k < 2.5) {
    float rad = 0.16 + fill * 0.18;
    if (extra < 0.5) p = tube(vec3(-0.95, 0.0, 0.0), vec3(0.95, 0.0, 0.0), along, ang, rad);
    else if (along < 0.5) p = tube(vec3(0.0, -0.95, 0.0), vec3(0.0, -0.32, 0.0), along * 2.0, ang, rad);
    else p = tube(vec3(0.0, 0.32, 0.0), vec3(0.0, 0.95, 0.0), (along - 0.5) * 2.0, ang, rad);
  } else if (k < 3.5) {
    float rr = fill * 0.14;
    p = vec3(0.7 + cos(ang) * rr, -0.16 - abs(sin(ang)) * rr, (hash21(along, extra) - 0.5) * 0.16);
    if (extra < 0.32) p = tube(vec3(-0.52, -1.02, 0.0), vec3(-0.52, 0.92, 0.0), along, ang, 0.08 + fill * 0.14);
    else if (extra < 0.6) p = tube(vec3(-0.52, 0.84, 0.0), vec3(1.05, 0.64, 0.0), along, ang, 0.06 + fill * 0.12);
    else if (extra < 0.72) p = tube(vec3(-0.52, 0.84, 0.0), vec3(-1.02, 0.72, 0.0), along, ang, 0.06 + fill * 0.12);
    else if (extra < 0.9) p = tube(vec3(0.7, 0.7, 0.0), vec3(0.7, -0.05, 0.0), along, ang, fill * 0.05);
  } else if (k < 4.5) {
    float z = (hash21(seed.x, extra) - 0.5) * 0.62;
    if (extra < 0.52) {
      float a = along * TAU;
      float r = 0.4 + fill * 0.3;
      p = vec3(cos(a) * r, sin(a) * r, z);
    } else {
      float tooth = min(floor(along * 8.0), 7.0);
      float a = (tooth + 0.5) / 8.0 * TAU;
      float r = 0.68 + fract(along * 8.0) * 0.4;
      float w = (hash21(extra, seed.y) - 0.5) * 0.28;
      p = vec3(cos(a) * r - sin(a) * w, sin(a) * r + cos(a) * w, z);
    }
  } else {
    float bar = min(floor(extra * 3.0), 2.0);
    float h = 0.62 + bar * 0.48;
    float jx = (hash21(seed.x, extra) - 0.5) * 0.38;
    float jz = (hash21(seed.y, extra) - 0.5) * 0.55;
    p = vec3((bar - 1.0) * 0.78 + jx, -0.72 + along * h, jz);
  }

  return p;
}

vec3 halo(vec3 seed) {
  float hz = (seed.z - 0.34) / 0.66;
  float az = seed.x * TAU;
  float cosP = hz * 2.0 - 1.0;
  float sinP = sqrt(max(0.0, 1.0 - cosP * cosP));
  // Biased inward so the cloud is dense in the middle and sparse at the rim.
  float R = 2.5 * pow(seed.y, 0.72);
  return vec3(cos(az) * sinP * R, cosP * R, sin(az) * sinP * R);
}

vec3 formation(int s, float t) {
  vec3 seed = position;

  if (s <= 0) {
    // Unmanaged: an unstructured cloud with slow, aimless drift.
    return vec3(
      (seed.x - 0.5) * 30.0 + sin(t * 0.18 + seed.y * TAU) * 0.9,
      (seed.y - 0.5) * 17.0 + cos(t * 0.15 + seed.z * TAU) * 0.7,
      (seed.z - 0.5) * 12.0
    );
  }
  if (s == 1) {
    // Discovery: the cloud resolves onto a regular lattice.
    return vec3(
      (aUV.x - 0.5) * 26.0,
      (aUV.y - 0.5) * 13.6,
      sin(aUV.x * 7.0 + t * 0.35) * 0.55
    );
  }
  if (s == 2) {
    // Ownership: three concentric tiers — Base, Pro, Premium.
    float tier = floor(aRand * 3.0);
    float r = 2.2 + tier * 1.75 + (seed.z - 0.5) * 0.3;
    float a = aUV.x * TAU + tier * 0.6 + t * (0.05 + tier * 0.02);
    return vec3(cos(a) * r * 1.8, sin(a) * r, (seed.x - 0.5) * 0.8);
  }
  if (s == 3) {
    // Security: a perimeter closes around the interior.
    float onRing = step(0.3, aRand);
    float a = aUV.x * TAU + t * 0.06;
    // sqrt spreads the interior evenly across the disc; a linear radius
    // piles everything into the centre.
    // Interior fills almost to the ring so the lighthouse shaft is a
    // continuous beam, not a disc and a rim with a dark moat between them.
    float r = mix(sqrt(seed.x) * 5.9, 6.4 + (seed.y - 0.5) * 0.28, onRing);
    return vec3(cos(a) * r * 1.8, sin(a) * r, (seed.z - 0.5) * 0.7);
  }
  if (s == 4) {
    // Industries: a small mark inside a sphere of orbs. Yaw only while
    // zoomed into this cluster.
    float k = min(floor(aRand * 6.0), 5.0);
    float match = uFocus < 0.0 ? 0.0 : (1.0 - step(0.5, abs(k - uFocus)));
    // Skip the mark maths for clusters the zoom has already dropped.
    if (uZoom > 0.45 && uFocus >= 0.0 && match < 0.5) {
      return vec3(0.0, -40.0, 0.0);
    }
    float a = k / 6.0 * TAU;
    float extra = fract(aRand * 6.0);
    vec3 local = seed.z < 0.34 ? glyph(k, seed, extra) * 0.22 : halo(seed);
    local = yaw(local, t * 0.35 * uZoom * match);
    return vec3(cos(a) * 9.5 + local.x, sin(a) * 4.7 + local.y, local.z);
  }
  if (s == 5) {
    // Response: radial spokes carrying a travelling pulse. The spokes start
    // clear of the origin, otherwise every one of them piles into the centre.
    float spokes = 28.0;
    float a = floor(aUV.y * spokes) / spokes * TAU;
    float rad = 1.5 + pow(aUV.x, 0.85) * 6.6;
    return vec3(cos(a) * rad * 1.7, sin(a) * rad, (seed.z - 0.5) * 0.5);
  }
  // Strategy: the field leans forward onto a receding horizon.
  float depth = aUV.y;
  return vec3(
    (aUV.x - 0.5) * 34.0 * (0.3 + depth * 0.95),
    -4.2 + depth * 6.4,
    -depth * 13.0
  );
}

/**
 * How much screen area each formation spreads the same point count over.
 * A ring packs sixty thousand points into a thin line and a cloud spreads
 * them over a volume; without per-formation weighting the tight ones
 * saturate to white while the loose ones disappear.
 */
float density(int s) {
  if (s <= 0) return 0.55;
  if (s == 1) return 0.85;
  if (s == 2) return 0.30;
  if (s == 3) return 0.32;
  if (s == 4) return 0.40;
  if (s == 5) return 0.20;
  return 0.60;
}

void main() {
  float ph = clamp(uPhase, 0.0, 6.0);
  int a = int(floor(ph));
  int b = int(min(floor(ph) + 1.0, 6.0));
  float m = smoothstep(0.0, 1.0, fract(ph));

  vec3 pos = mix(formation(a, uTime), formation(b, uTime), m);

  // Flashlight: nearby points brighten. They do not move.
  // uMouse is world XY on the z=0 plane, unprojected through the live camera.
  // uGlowScale = camera.z / 20 so the shaft keeps its screen size when closer.
  float toMouse = length(pos.xy - uMouse);
  float glow = smoothstep(5.8 * uGlowScale, 0.0, toMouse);

  vAlpha = 0.62 * mix(density(a), density(b), m) * uIntensity;
  vAlpha *= mix(1.0, 2.2, glow);
  vDetect = 0.0;

  // Hover focus: pull the matching industry cluster or ownership tier
  // forward and dim the rest. uFocus < 0 means nothing is selected.
  if (uFocus >= 0.0) {
    float nearOwnership = 1.0 - clamp(abs(ph - 2.0), 0.0, 1.0);
    float nearIndustries = 1.0 - clamp(abs(ph - 4.0), 0.0, 1.0);
    if (nearOwnership > 0.0) {
      float tier = floor(aRand * 3.0);
      float match = 1.0 - step(0.5, abs(tier - uFocus));
      vAlpha *= mix(0.38, 1.75, match);
      pos.z += match * 0.9 * nearOwnership;
    }
    if (nearIndustries > 0.0) {
      float k = floor(aRand * 6.0);
      float match = 1.0 - step(0.5, abs(k - uFocus));
      float dim = mix(0.32, 0.08, uZoom);
      float lift = mix(1.85, 2.1, uZoom);
      vAlpha *= mix(dim, lift, match);
      pos.z += match * 1.5 * nearIndustries;
    }
  }

  // A small minority of points carry the accent. Glow warms the hot
  // centre of the flashlight without turning the field orange.
  vGold = step(0.955, aGold) * 0.7;
  vGold = max(vGold, glow * glow * 0.45);

  // Discovery: emphasise every few rows and columns so the lattice reads as
  // structure rather than as a finer grade of noise.
  float nearDiscovery = 1.0 - clamp(abs(ph - 1.0), 0.0, 1.0);
  if (nearDiscovery > 0.0) {
    float gx = abs(fract(aUV.x * 42.0) - 0.5);
    float gy = abs(fract(aUV.y * 24.0) - 0.5);
    float onLine = smoothstep(0.40, 0.5, max(gx, gy));
    vAlpha *= mix(1.0, mix(0.45, 1.9, onLine), nearDiscovery);
  }

  // Security: a lighthouse beam rotates from the centre and is absorbed
  // when it hits the perimeter. The shaft is a narrow wedge; the ring
  // glow is the same sweep landing on the edge, not a substitute for it.
  float nearSecurity = 1.0 - clamp(abs(ph - 3.0), 0.0, 1.0);
  float beam = 0.0;
  if (nearSecurity > 0.0) {
    float ang = atan(pos.y, pos.x);
    float heading = uTime * 0.55;
    float da = atan(sin(ang - heading), cos(ang - heading));
    float ellipseR = length(pos.xy / vec2(1.8, 1.0));
    // ~11 degree half-width, soft edges so it reads as a shaft not a pie.
    float shaft = smoothstep(0.20, 0.03, abs(da));
    float along = smoothstep(0.08, 0.7, ellipseR) * (1.0 - smoothstep(7.0, 7.8, ellipseR));
    beam = shaft * along * nearSecurity;
    vGold = max(vGold, beam);
    vAlpha *= mix(1.0, 2.4, beam);

    float atPerimeter = smoothstep(5.4, 6.3, ellipseR) * (1.0 - smoothstep(6.9, 7.5, ellipseR));
    vGold = max(vGold, shaft * atPerimeter * nearSecurity);

    // Marked endpoints light red when the shaft hits them. aGold is seeded
    // once, so the same dots detect on every 360° pass.
    float marked = step(0.91, aGold);
    vDetect = shaft * marked * nearSecurity;
    vAlpha *= mix(1.0, 2.6, vDetect);
  }

  // Response: a wave travels out from the centre and back.
  float nearResponse = 1.0 - clamp(abs(ph - 5.0), 0.0, 1.0);
  if (nearResponse > 0.0) {
    float rad = length(pos.xy);
    float wave = smoothstep(0.80, 1.0, sin(rad * 0.7 - uTime * 2.0));
    vGold = max(vGold, wave * nearResponse * 0.9);
  }

  // Strategy: dissolve into the horizon and pick out lanes along the
  // direction of travel, so the plane reads as distance rather than a slab.
  float nearStrategy = smoothstep(5.0, 6.0, ph);
  if (nearStrategy > 0.0) {
    float fade = 1.0 - smoothstep(0.45, 1.0, aUV.y);
    float lane = smoothstep(0.38, 0.5, abs(fract(aUV.x * 26.0) - 0.5));
    vAlpha *= mix(1.0, fade * mix(0.5, 1.6, lane), nearStrategy);
  }

  // Industry cloud glows from its own centre: hot in the middle, a faint
  // dusting at the rim. The mark is a small bright object inside that glow.
  float nearIndustries = 1.0 - clamp(abs(ph - 4.0), 0.0, 1.0);
  float onGlyph = (1.0 - step(0.34, position.z)) * nearIndustries;
  float onHalo = step(0.34, position.z) * nearIndustries;
  float core = 0.0;
  if (nearIndustries > 0.0) {
    float kk = min(floor(aRand * 6.0), 5.0);
    float ca = kk / 6.0 * 6.2831853;
    vec2 ctr = vec2(cos(ca) * 9.5, sin(ca) * 4.7);
    float rad = length(vec3(pos.x - ctr.x, pos.y - ctr.y, pos.z));
    core = pow(clamp(1.0 - rad / 2.5, 0.0, 1.0), 1.35);
  }
  vAlpha *= mix(1.0, 1.35, onGlyph);
  vAlpha *= mix(1.0, mix(0.16, 1.85, core), onHalo);

  // Once a zoom is underway, stop rasterising the other five clusters.
  // That is the expensive part of flying in on a slower GPU.
  float hide = 0.0;
  if (nearIndustries > 0.0 && uFocus >= 0.0) {
    float k = floor(aRand * 6.0);
    float match = 1.0 - step(0.5, abs(k - uFocus));
    hide = (1.0 - match) * smoothstep(0.06, 0.28, uZoom);
  }

  // Driven by the contact form: the field tightens as the form completes.
  vAlpha *= mix(1.0, 1.7, uResolve);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float size = mix(0.9, 2.0, aRand) + vGold * 0.7 + beam * 0.9 + glow * 0.85 + vDetect * 0.8 + onGlyph * 0.45 + onHalo * core * 0.7;
  float px = size * uPixelRatio * (44.0 / max(-mv.z, 0.001));
  float cap = mix(18.0, mix(12.0, 7.5, uLite), uZoom);
  gl_PointSize = min(px, cap) * (1.0 - hide);
  if (hide > 0.97) {
    gl_Position = vec4(3.0, 3.0, 0.0, 1.0);
  } else {
    gl_Position = projectionMatrix * mv;
  }
}
`;

export const fragmentShader = /* glsl */ `
precision mediump float;

uniform vec3 uBase;
uniform vec3 uAccent;
uniform vec3 uDetect;

varying float vAlpha;
varying float vGold;
varying float vDetect;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;

  float soft = smoothstep(0.25, 0.0, r2);
  vec3 c = mix(uBase, uAccent, vGold);
  c = mix(c, uDetect, vDetect);
  gl_FragColor = vec4(c, soft * vAlpha);
}
`;
