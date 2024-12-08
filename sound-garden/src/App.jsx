import './App.css';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './components/Scene.jsx';
import { useRef, useEffect, useState } from 'react';
// import P5sketch from './components/p5sketch.jsx';
// import CircleSectionsP5 from './components/CircleSectionsP5.jsx';
// import P5SketchWrapper from './components/P5SketchWrapper.jsx';

function App() {
  const cameraRotation = [0, 1.5, 0];
  const cameraPosition = [4.5, 3, 0];

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const treeScalesRef = useRef(new Array(27).fill(1.5)); // Store 27 values (9 for each circle)
    // Turn 27 into a variable
  const [isConnected, setIsConnected] = useState(false); // connection state

  // POssible soluton 👾🟢
  const [treeScalesUpdate, setTreeScalesUpdate] = useState(0);


  // Connect to serial port
  const connectSerial = async () => {
    try {
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });

      const newReader = newPort.readable.getReader();
      portRef.current = newPort;
      readerRef.current = newReader;
      setIsConnected(true);  // Update connection state

      readSerial(newReader);
    } catch (err) {
      console.error('Serial port error:', err);
      setIsConnected(false);
    }
  };

  // Read serial data
  const readSerial = async (reader) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Serial port closed by device");
          setIsConnected(false);
          break;
        }

        // Parse the CSV data
        const text = new TextDecoder().decode(value);
        const values = text.trim().split(',').map(Number);

        if (values.length === 27) {
          // TODO: 27 as a variable Nr of values sent by Serial Monitor
          treeScalesRef.current = values;

          // 🌸 Possible solution 👾🟢
          // Force update
          setTreeScalesUpdate(prev => prev + 1);
          // 🌸 Possible solution 👾🟢

          // console.log('Tree scales being passed to Scene:', treeScalesRef.current);
        }
      }
    } catch (err) {
      console.error('Error reading serial:', err);
      setIsConnected(false);
    } finally {
      reader.releaseLock();
      readerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
      if (portRef.current) {
        portRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {/* <P5SketchWrapper/> */}
      {/* <P5sketch/>
      <CircleSectionsP5/> */}

      {/* Connect button outside Canvas */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
      }}>
        {!isConnected && (
          <button onClick={connectSerial}>
            Connect to Serial Port
          </button>
        )}
      </div>

      <Canvas
          shadows
          dpr={ 1 }
          style={{ width: '100vw', height: '100vh', backgroundColor: 'rgb(181, 79, 111)'}}
          // position: 'fixed', top: 0, right: 0,

          gl={ {
            antialias: true, // For smooth edges
            alpha: true, // for transparent background
            toneMapping: THREE.ACESFilmicToneMapping, // Default
          } }
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: cameraPosition,
            rotation: cameraRotation,
          }}>
          <Scene treeScales={treeScalesRef.current} key={treeScalesUpdate}/>
        </Canvas>
    </>
  )
}

export default App
