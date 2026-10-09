/**
 * Still frame of the SecureAI centerpiece: the glass cube with a few nodes
 * inside. Server-rendered, so it is the first paint and the no-WebGL frame.
 */
export function AiCorePoster({ className = "" }: { className?: string }) {
  const nodes: [number, number, number][] = [
    [200, 200, 1],
    [168, 168, 0],
    [238, 176, 0],
    [224, 234, 0],
    [160, 222, 0],
    [204, 142, 0],
    [252, 212, 1],
    [146, 190, 0],
    [190, 258, 1],
    [236, 258, 0],
    [174, 136, 0],
  ];
  const links: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 8], [4, 7], [4, 8], [1, 7], [1, 10], [5, 10], [3, 9], [6, 9],
  ];
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#4f86b4" strokeOpacity="0.25" strokeWidth="1">
        {links.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      {nodes.map(([x, y, hot], i) => (
        <circle key={i} cx={x} cy={y} r={hot ? 3.4 : 2.2} fill={hot ? "#f5b700" : "#4f86b4"} fillOpacity={hot ? 0.95 : 0.8} />
      ))}
      <circle cx="200" cy="200" r="34" fill="#f5b700" fillOpacity="0.07" />
      <g stroke="#4f86b4" strokeOpacity="0.55" strokeWidth="1.1" strokeLinejoin="round">
        <polygon points="303.9,260 200,320 96.1,260 96.1,140 200,80 303.9,140" />
        <path d="M200 320 L200 200 L96.1 140 M200 200 L303.9 140" />
      </g>
      <g fill="#f5b700">
        {[[303.9, 260], [200, 320], [96.1, 260], [96.1, 140], [200, 80], [303.9, 140], [200, 200]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
        ))}
      </g>
    </svg>
  );
}
