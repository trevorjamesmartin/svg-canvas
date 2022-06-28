import React from "react";

export interface SVGi {
  coord: {
    x: number;
    y: number;
  },
  last: any[],
  shape: number | string
}

function toSVG(arr:string[], c?:any, b?:any) {
  let color = c ? c : '#000000';
  let svgBackgroundColor = b ? b : 'transparent';
  let svglog = arr;
  if (!svglog) return []
  return svglog.map((s:string, i:number) => {
    const [shape, ...arg0] = s.split(':');
    const args = arg0.join('');
    switch (shape) {
      case "circle":
        let [c, r] = args.split(' ');
        let [cx, cy] = c.split(',');
        return <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth="2"
          fill={svgBackgroundColor}
        />
      case "rectangle":
        let [tl, w, h] = args.split(' ');
        let [x, y] = tl.split(',');
        return <rect
          x={x}
          y={y}
          width={w}
          height={h}
          stroke={color}
          strokeWidth="2"
          fill={svgBackgroundColor}
        />
      case "line":
        const [one, two] = args.split(' ');
        const [onex, oney] = one.split(',');
        const [twox, twoy] = two.split(',');
        return <line
          key={i}
          x1={onex}
          y1={oney}
          x2={twox}
          y2={twoy}
          stroke={color}
        />
      default:
        return null
    }
  });
}

export const translateCorners = (i:any) => {
  return {
    tl: [Math.min(i.last[0].x, i.coord.x), Math.min(i.last[0].y, i.coord.y)],
    br: [Math.max(i.last[0].x, i.coord.x), Math.max(i.last[0].y, i.coord.y)]
  }
}

export const toSVGLog = (humanInput:any) => {
  let svgstring;
  switch (humanInput.shape) {
    case 2:
      const c = humanInput.last[0];
      const a = humanInput.coord;
      const r = Math.sqrt(((c.x - a.x) ** 2) + ((c.y - a.y) ** 2));
      svgstring = `circle:${c.x},${c.y} ${r}`
      break;
    case 1:
      const {tl, br} = translateCorners(humanInput);
      const [x1, y1] = tl;
      const [x2, y2] = br;
      svgstring = `rectangle:${x1},${y1} ${Math.abs(x1 - x2)} ${Math.abs(y1 - y2)}`;
      break;
    case 0:
      svgstring = `line:${humanInput.last[0].x},${humanInput.last[0].y} ${humanInput.coord.x},${humanInput.coord.y}`;
      break;
    default:
      break;
  }
  return svgstring;
}

export function previewShape(humanInput:any, options?:any) {
  let color = 'blue';
  let svgBackgroundColor = "transparent";
  if (!humanInput.last.length) return
  let shape;
  switch (humanInput.shape) {
    case 2:
      shape = <circle
        cx={humanInput.last[0].x}
        cy={humanInput.last[0].y}
        r={(() => {
          let z = humanInput.last[0] || undefined;
          let a = humanInput.coord;
          return Math.sqrt(((z.x - a.x) ** 2) + ((z.y - a.y) ** 2))
        })()} stroke={color} strokeWidth="2" fill={svgBackgroundColor} />
      break;
    case 1:
      shape =  <polyline points={`${humanInput.last[0].x},${humanInput.last[0].y} ${humanInput.coord.x},${humanInput.last[0].y} ${humanInput.coord.x},${humanInput.coord.y} ${humanInput.last[0].x} ${humanInput.coord.y} ${humanInput.last[0].x},${humanInput.last[0].y}`} strokeWidth="2" fill="none" stroke={color} />
      break;
    case 0:
    default:
      shape = <line
        x1={humanInput.last[0].x}
        y1={humanInput.last[0].y}
        x2={humanInput.coord.x}
        y2={humanInput.coord.y}
        stroke={color} />
  }
  return shape;
}

export default toSVG;
