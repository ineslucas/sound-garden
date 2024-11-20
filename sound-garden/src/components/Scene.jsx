// Path: src/components/Scene.jsx

import Tree from './Tree';
import { SoftShadows, OrbitControls, MapControls } from "@react-three/drei";

export default function Scene() {
  return <>
    <SoftShadows size={ 80 } samples={ 20 } focus={ 0 } />
    <OrbitControls />
    <MapControls />

    {/* TODO for each function that places the trees in different places */}

    <Tree position={[-1, -2.5, -8]} />
    <Tree position={[-2, -1.5 , -6]} />
    <Tree position={[0, -1.2 , -3]} />
    <Tree position={[0, -1.5 , 0]} />
    <Tree position={[0, -1, 3]} />
    <Tree position={[0, -1.7, 6]} />

    <ambientLight intensity={ 1 } />
    <directionalLight
      position={ [ 1, 3, 1.8] }
      intensity={ 4 }
      castShadow
      shadow-mapSize={ [1024 * 3, 1024 * 3] }
      shadow-camera-top={ 4 }
      shadow-camera-right={ 4 }
      shadow-camera-bottom={ -3 }
      shadow-camera-left={ -2 }
      shadow-camera-near={ 0.5 }
      shadow-camera-far={ 50 }
    />
  </>
}
