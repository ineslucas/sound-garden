import './App.css';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './components/Scene.jsx';

function App() {
  const cameraRotation = [0, 1.5, 0];
  const cameraPosition = [4.5, 3, 0];

  return (
    <>
      <Canvas
          shadows
          dpr={ 1 }
          style={{ width: '100vw', height: '100vh', position: 'fixed', bottom: 0, right: 0, backgroundColor: 'rgb(181, 79, 111)'}}

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
    </>
  )
}

export default App
