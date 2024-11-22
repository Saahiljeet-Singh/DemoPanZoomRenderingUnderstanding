import React from 'react';
import logo from './logo.svg';
import './App.css';
import { get } from 'http';
import { useDebounce } from './useDebounce';
import { useAsync } from '@fluentui/react-hooks';

const zoomMultiplierFactor = 1.15;

function App() {
  const getRandColor = ():string => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [showHeavyContent, setShowHeavyContent] = React.useState(false);
    const [currentZoom, setCurrentZoom] = React.useState(1);
    const [debounceEnabled, setDebounceEnabled] = React.useState(false);
  
  const createContent = React.useMemo(():any => {
    // Create 10 divs of size 10 by 10 with random color background placed in a row and create 5 such rows
    let content = [];
    for (let i = 0; i < 8; i++) {
      let row = [];
      for (let j = 0; j < 8; j++) {
        let color = getRandColor();
        row.push(<div style={{width: '100px', height: '100px', backgroundColor: color, display: 'inline-block'}}>
          This is a div
        </div>);
      }
      content.push(<div>{row}</div>);
    }
    return content;
  },[]);

  const createHeavyContent = React.useMemo(():any => {
    // Create 100 divs of size 10 by 10 with random color background placed in a row and create 100 such rows
    let content = [];
    for (let i = 0; i < 100; i++) {
      let row = [];
      for (let j = 0; j < 1000; j++) {
        let color = getRandColor();
        row.push(<div style={{width: '5px', height: '5px', backgroundColor: color, display: 'inline-block'}}></div>);
      }
      content.push(<div>{row}</div>);
    }
    return content;
  },[]);
  const addbuttons = React.useMemo(():any => {
    // Create 5 buttons with different colors and text
    let buttons = [];
    const zoomContentByTransform = (e: any) => {      
      const newZoomValue = currentZoom * zoomMultiplierFactor;
      if (contentRef.current) {
        contentRef.current.style.transform = `scale(${newZoomValue})`;
      }
      setCurrentZoom(newZoomValue);
    }

    // add a function which changes height and width of the divs
    const zoomContentHeightWidth = (e: any) => {
      console.log(e.target);
      // e.target.style.height = '200px';
      // e.target.style.width = '200px';
      const newZoomValue = currentZoom * zoomMultiplierFactor;

      const currentHeight = contentRef.current?.clientHeight
      const currentWidth = contentRef.current?.clientWidth;
      if (contentRef.current && currentHeight && currentWidth) {
        // contentRef.current.style.height = ((currentHeight) * 2) + 'px';
        // contentRef.current.style.width = ((currentWidth ) * 2) + 'px';
        contentRef.current.style.scale = `${newZoomValue}`;
      }
      setCurrentZoom(newZoomValue);
    }

    const resetZoom = (e: any) => {
      if (contentRef.current) {
        contentRef.current.style.transform = 'scale(1)';
        contentRef.current.style.scale = '1';
        setCurrentZoom(1);
      }
    }

    let color = getRandColor();
    const simpleZoomButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={zoomContentHeightWidth}>Zoom by height/width</button>
    color = getRandColor();
    const transformZoomButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={zoomContentByTransform}>Zoom by transform</button>
    color = getRandColor();
    const resetZoomButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={resetZoom}>Reset Zoom</button>
    color = getRandColor();
    const showHeavyContentButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={() => setShowHeavyContent(!showHeavyContent)}>Toggle Heavy Content</button>
    color = getRandColor();
    const enableDebounceButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={() => setDebounceEnabled(!debounceEnabled)}>{`Toggle Debounce - current ${debounceEnabled}`}</button>
    color = getRandColor();
    const justChangeColor = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={() => {
      if (contentRef.current) {
        contentRef.current.style.backgroundColor = getRandColor();
      }
    }}>Change Color</button>
    const rotateContentButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={() => {
      if (contentRef.current) {
        contentRef.current.style.transform = 'rotate(90deg)';
      }
    }}>Rotate Content</button>
    color = getRandColor();
    const getBoundingRectButton = <button style={{backgroundColor: color, width: '100px', height: '50px', margin: '10px'}} onClick={() => {
      if (contentRef.current) {
        console.log('Print');//contentRef.current.getBoundingClientRect());
      }
    } }>Get Bounding Rect</button>
    

    buttons.push(simpleZoomButton);
    buttons.push(transformZoomButton);
    buttons.push(resetZoomButton);
    buttons.push(showHeavyContentButton);
    
    /*
    buttons.push(enableDebounceButton);
    buttons.push(justChangeColor);
    buttons.push(rotateContentButton);
    buttons.push(getBoundingRectButton);
    */
   
    return buttons;
  },[currentZoom, debounceEnabled, showHeavyContent]);


  const dragStartXRef = React.useRef(0);
  const dragStartYRef = React.useRef(0);

  const onDragEnd = (e: any) => {   
    console.log('drag end');
    const clientX = e.clientX;
    const clientY = e.clientY;
    console.log(clientX, clientY);
    const offsetX = clientX - dragStartXRef.current;
    const offsetY = clientY - dragStartYRef.current;
    if(contentRef.current) {
      contentRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px , 0px)`;
    }
    e.preventDefault();
    // e.stopPropagation();
  }

  const onDragStart = (e: any) => {
    // capture the current position of the div
    console.log('drag start');
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragStartXRef.current = clientX;
    dragStartYRef.current = clientY;
  }

 

  const wheelZoomCommon = React.useCallback((e: React.WheelEvent<HTMLElement>) => {
    console.log('wheel zoom common');
    if (e.deltaY > 0) {
      // zoom out
      const newZoomValue = currentZoom / zoomMultiplierFactor;
      if (contentRef.current) {
        contentRef.current.style.transform = `scale(${newZoomValue})`;
      }
      setCurrentZoom(newZoomValue);
    } else {
      // zoom in
      const newZoomValue = currentZoom * zoomMultiplierFactor;
      if (contentRef.current) {
        contentRef.current.style.transform = `scale(${newZoomValue})`;
      }
      setCurrentZoom(newZoomValue);
    }
  },[currentZoom]);
  const asyncInstance = useAsync();
  const debouncedZoom = asyncInstance.debounce((e: React.WheelEvent<HTMLElement>) => {
    if (!e) return; 
    console.log('debounced zoom');

    wheelZoomCommon(e);
   
  }, 50, { leading: false, trailing: true });

  const onWheel = React.useCallback((e: React.WheelEvent<HTMLElement>) => {
    console.log('wheel event');
    if (debounceEnabled) {
      debouncedZoom(e);
    } else {
      wheelZoomCommon(e);
    }
    // debouncedZoom(e);
  }, [debounceEnabled, debouncedZoom, wheelZoomCommon]);
 
  React.useEffect(() => {
   
    return () => {
      setCurrentZoom(1);
      setShowHeavyContent(false);
    }
  },[]);
  return (
    <div className="App">
      <div draggable="true" onDragStart={onDragStart} onDragEnd={onDragEnd} id="ContentDiv" ref={contentRef} onWheel={onWheel}>
        {showHeavyContent ? createHeavyContent :createContent}
      </div>
      <div id="ButtonDiv">
        {addbuttons}
      </div>
    </div>
  );
}

export default App;
