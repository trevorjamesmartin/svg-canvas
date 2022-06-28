import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import './App.css';

interface SVGi {
  coord: {
    x: number;
    y: number;
  },
  last: any[],
  shape: number | string
}

function App() {
  const svgElement: any = useRef();
  const [svglog, setLog] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [color, setColor] = useState<any>(searchParams.get('fg') || '#000000');
  const [svgBackgroundColor, setSVGBackgroundColor] = useState<any>(searchParams.get('bg') ? searchParams.get('bg') : 'transparent');
  const [humanInput, setHumanInput] = useState<SVGi>({ coord: { x: 0, y: 0 }, last: [], shape: 0 });
  const [popup, setPopup] = useState<any[]>([]);
  const [svgArea, setSvgArea] = useState<any>({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    window.onresize = () => {
      setSvgArea({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  // download handlers
  const triggerDownload = (imgURI: any) => {
    let a:HTMLAnchorElement = document.createElement('a');
    a.setAttribute('download', `image-${Date.now()}.svg`);
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.click();
  }

  const saveToFile = () => {
    let data = (new XMLSerializer()).serializeToString(svgElement.current);
    let svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    let url = URL.createObjectURL(svgBlob);
    triggerDownload(url);
  }

  const handleCaptureMouse = (e: any) => {
    setHumanInput({
      ...humanInput,
      coord: { x: e.clientX, y: e.clientY }
    });
  }
  const translate = () => {
    return {
      tl: [Math.min(humanInput.last[0].x, humanInput.coord.x), Math.min(humanInput.last[0].y, humanInput.coord.y)],
      br: [Math.max(humanInput.last[0].x, humanInput.coord.x), Math.max(humanInput.last[0].y, humanInput.coord.y)]
    }
  }

  const handleClick = (e: any) => {
    
    if (popup) {
      setPopup([]);
    }
    if (!humanInput.last.length) {
      setHumanInput({
        ...humanInput, last: [{
          x: humanInput.coord.x, y: humanInput.coord.y
        }]
      });
    } else {
      switch (humanInput.shape) {
        case 2:
          const c = humanInput.last[0];
          const a = humanInput.coord;
          const r = Math.sqrt(((c.x - a.x) ** 2) + ((c.y - a.y) ** 2));
          setLog([...svglog,
          <circle
            cx={c.x}
            cy={c.y}
            r={r}
            stroke={color}
            strokeWidth="2"
            fill={svgBackgroundColor}
          />
          ]);
          setHumanInput({ ...humanInput, last: [] });
          break;
        case 1:
          const { tl, br } = translate();
          setLog([...svglog,
          <rect
            x={tl[0]}
            y={tl[1]}
            width={Math.abs(tl[0] - br[0])}
            height={Math.abs(tl[1] - br[1])}
            stroke={color}
            strokeWidth="2"
            fill={svgBackgroundColor}
          />
          ]);
          setHumanInput({ ...humanInput, last: [] });
          break;
        case 0:
          // draw the line
          const one = humanInput.last[0];
          const two = {
            x: humanInput.coord.x,
            y: humanInput.coord.y
          };
          setLog([...svglog,
          <line
            x1={one.x}
            y1={one.y}
            x2={two.x}
            y2={two.y}
            stroke={color}
          />]);
          // clear the buffer
          setHumanInput({ ...humanInput, last: [] });
          break;
        default:
          break;
      }
    }
  }

  const selectMenuItem = (value: string) => {
    switch (value) {
      case "line":
        setHumanInput({ ...humanInput, shape: 0 });
        break;
      case "rectangle":
        setHumanInput({ ...humanInput, shape: 1 });
        break;
      case "circle":
        setHumanInput({ ...humanInput, shape: 2 });
        break;
      case "undo":
        setLog(svglog.slice(0, -1));
        break;
      default:
        setHumanInput({ ...humanInput, last: [] });

        break;
    }
    setPopup([]);
  }
  const handleContextMenu = (e: any) => {
    // clear last coordinates
    e.preventDefault();
    setHumanInput({ ...humanInput, last: [] });
    let { x, y } = humanInput.coord;
    setPopup([<ul style={{
      left: x, top: y,
      position: 'absolute',
    }}
      className='rc-menu'
    >
      <li key="line" className={humanInput.shape === 0 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        selectMenuItem('line');
      }}>line</li>
      <li key="rectangle" className={humanInput.shape === 1 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        selectMenuItem('rectangle');
      }}>rectangle</li>
      <li key="circle" className={humanInput.shape === 2 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        selectMenuItem('circle');
      }}>circle</li>
      <li key="undo" className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        selectMenuItem('undo');
      }}>undo</li>
      <li key="blank" onClick={()=>selectMenuItem('blank')} className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'}> ~ </li>
      <li key="save" onClick={saveToFile} className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'}>save</li>

    </ul>]);

  }

  return (<>
    <svg
      ref={svgElement}
      viewBox={`0 0 ${svgArea.width} ${svgArea.height}`}
      onMouseMove={handleCaptureMouse}
      // preserveAspectRatio="xMidYMid slice"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ width: svgArea.width, height: svgArea.height, position: "absolute", top: 0, left: 0, zIndex: -1 }}>
      Sorry, your browser does not support inline SVG.
      {[...svglog]}

      {[humanInput.shape === 0 ? (
        <line
          x1={humanInput.last.length ? humanInput.last[0].x : 0}
          y1={humanInput.last.length ? humanInput.last[0].y : 0}
          x2={humanInput.coord.x || 0}
          y2={humanInput.coord.y || 0}
          stroke={humanInput.last.length ? "blue" : "transparent"} />
      ) : humanInput.shape === 1 && humanInput.last.length ? (
        <polyline points={`${humanInput.last[0].x},${humanInput.last[0].y} ${humanInput.coord.x},${humanInput.last[0].y} ${humanInput.coord.x},${humanInput.coord.y} ${humanInput.last[0].x} ${humanInput.coord.y} ${humanInput.last[0].x},${humanInput.last[0].y}`} strokeWidth="2" fill="none" stroke="blue" />
      )
        : humanInput.shape === 2 ? (
          (humanInput.last[0] || undefined) ?
            <circle
              cx={humanInput.last.length ? humanInput.last[0].x : 0}
              cy={humanInput.last.length ? humanInput.last[0].y : 0}
              r={(() => {
                let z = humanInput.last[0] || undefined;
                let a = humanInput.coord;
                return Math.sqrt(((z.x - a.x) ** 2) + ((z.y - a.y) ** 2))
              })()} stroke={humanInput.last.length ? "blue" : "transparent"} strokeWidth="2" fill={svgBackgroundColor} />
            : <></>) : <></>
      ]}
    </svg>
    {[popup]}
  </>
  );
}

export default App;
