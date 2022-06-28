import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import toSVG, { SVGi, toSVGLog, previewShape} from './util/toSVG';

import './App.css';
const defaultColors = {
  fg: '#000000',
  bg: '#11111100'
}
function App() {
  const svgElement: any = useRef();
  const [svglog, setLog] = useLocalStorage('svg', []);
  const [searchParams,] = useSearchParams();
  const [color, setColor] = useState<any>(searchParams.get('fg') || defaultColors.fg);
  const [bgColor, setBackgroundColor] = useState<any>(searchParams.get('bg') ? searchParams.get('bg') : defaultColors.bg);
  const [humanInput, setHumanInput] = useState<SVGi>({ coord: { x: 0, y: 0 }, last: [], shape: 0 });
  const [popup, setPopup] = useState<any[]>([]);
  const [svgArea, setSvgArea] = useState<any>({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    window.onresize = () => {
      setSvgArea({ width: window.innerWidth, height: window.innerHeight });
    }
  }, [color, bgColor]);

  const triggerDownload = (imgURI: any) => {
    let a: HTMLAnchorElement = document.createElement('a');
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
      const item = toSVGLog(humanInput, color, bgColor);
      setLog([...svglog, item]);
      setHumanInput({ ...humanInput, last: [] });
    }
  }

  const handleContextMenu = (e: any) => {
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
        setHumanInput({ ...humanInput, shape: 0 });
        setPopup([]);
      }}>line</li>
      <li key="rectangle" className={humanInput.shape === 1 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        setHumanInput({ ...humanInput, shape: 1 });
        setPopup([]);
      }}>rectangle</li>
      <li key="circle" className={humanInput.shape === 2 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        setHumanInput({ ...humanInput, shape: 2 });
        setPopup([]);
      }}>circle</li>
      <li key="undo" className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'} onClick={() => {
        setLog(svglog.slice(0, -1));
        setPopup([]);
      }}>undo</li>
      <li key="blank1" onClick={() => {
        setHumanInput({ ...humanInput, last: [] });
        setPopup([]);
        }} className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'}> ~ </li>
      <li key="" className={'rc-menu-item-active' || 'rc-menu-item'}>
        <input type="color" id="html5colorpicker1" value={color} onChange={(e:any) => setColor(e?.target?.value || '#00000000')}></input>
        <input type="color" id="html5colorpicker2" value={bgColor} onChange={(e:any) => setBackgroundColor(e?.target?.value || '#00000000')}>
      </input></li>
      <li key="blank2" onClick={() => {
        setHumanInput({ ...humanInput, last: [] });
        setPopup([]);
        setColor(defaultColors.fg)
        setBackgroundColor(defaultColors.bg);
        }} className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'}>~ reset colors</li>
      <li key="save" onClick={() => {
        saveToFile();
        setPopup([]);
      }} className={humanInput.shape === 3 ? 'rc-menu-item-active' : 'rc-menu-item'}>save</li>
    </ul>]);
  }

  return (<>
    <svg
      ref={svgElement}
      viewBox={`0 0 ${svgArea.width} ${svgArea.height}`}
      onMouseMove={handleCaptureMouse}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ width: svgArea.width, height: svgArea.height, position: "absolute", top: 0, left: 0, zIndex: -1 }}>
      Sorry, your browser does not support inline SVG.
      {[...toSVG(svglog)]}
      {[previewShape(humanInput)]}
    </svg>
    {[popup]}
  </>);
}

export default App;
