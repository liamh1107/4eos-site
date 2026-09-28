import {
  buildSeeds,
  clusterCenter,
  formation,
  PHASE_CAPTION,
  PHASE_INDEX,
  type Phase,
} from "./formations";

/**
 * Server-rendered still of one formation, for phones and anything without
 * WebGL. Same maths as the live field, projected through the same camera, so
 * the fallback is the real thing held still rather than a different picture.
 */

const VB_W = 1200;
const VB_H = 800;
const CAM_Z = 20;
const FOV = 45;
const ASPECT = VB_W / VB_H;
const FOCAL = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);

type PosterProps = {
  phase: Phase;
  /** Point count. The live field uses tens of thousands; this needs enough
   *  to read as a field and few enough to stay small in the HTML. */
  points?: number;
  className?: string;
};

export function SignalPoster({
  phase,
  points = phase === "industries" ? 1400 : 320,
  className = "",
}: PosterProps) {
  const index = PHASE_INDEX[phase];
  const seeds = buildSeeds(points);

  const dots: string[] = [];

  for (const s of seeds) {
    const [x, y, z] = formation(index, s, 0);
    const depth = CAM_Z - z;
    if (depth <= 0.2) continue;

    const ndcX = ((FOCAL / ASPECT) * x) / depth;
    const ndcY = (FOCAL * y) / depth;
    if (Math.abs(ndcX) > 1.25 || Math.abs(ndcY) > 1.25) continue;

    const px = Math.round((ndcX * 0.5 + 0.5) * VB_W);
    const py = Math.round((0.5 - ndcY * 0.5) * VB_H);
    // The poster is not additive and carries two orders of magnitude fewer
    // points, so it is drawn larger and more opaque than the live field to
    // land at the same apparent density.
    let r = Math.round(Math.max(0.8, (1.4 + s.rand * 1.6) * (20 / depth)) * 10) / 10;

    const gold = s.gold > 0.955;
    let o = Math.round((gold ? 0.7 : 0.26 + s.rand * 0.18) * 100) / 100;
    if (phase === "industries") {
      const k = Math.min(5, Math.floor(s.rand * 6));
      const [cx, cy] = clusterCenter(k);
      const rad = Math.hypot(x - cx, y - cy, z);
      const fall = Math.pow(Math.max(0, 1 - rad / 2.5), 1.35);
      const glyph = s.seed[2] < 0.34;
      o = glyph ? 0.85 : Math.round((0.06 + fall * 0.72) * 100) / 100;
      r = Math.round(r * (glyph ? 0.7 : 0.55 + fall * 0.9) * 10) / 10;
    }
    dots.push(
      `<circle cx="${px}" cy="${py}" r="${r}" fill="${gold ? "#F5B700" : "#4F86B4"}" opacity="${o}"/>`,
    );
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={PHASE_CAPTION[phase]}
      // The markup is generated above rather than mapped to JSX because a few
      // hundred <circle> elements as React nodes is a lot of reconciler work
      // for something that never changes.
      dangerouslySetInnerHTML={{ __html: dots.join("") }}
    />
  );
}
