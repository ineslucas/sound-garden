import './App.css';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './components/Scene.jsx';
import P5sketch from './components/p5sketch.jsx';
import CircleSectionsP5 from './components/CircleSectionsP5.jsx';

function App() {
  const cameraRotation = [0, 1.5, 0];
  const cameraPosition = [4.5, 3, 0];

  return (
    <>
      <Canvas
          shadows
          dpr={ 1 }
          style={{ width: '100vw', height: '50vh', backgroundColor: 'rgb(181, 79, 111)'}}
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
          <Scene />
        </Canvas>

        <P5sketch/>
        <CircleSectionsP5/>
    </>
  )
}

export default App
