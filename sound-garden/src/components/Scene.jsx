import Tree from './Tree';
import { SoftShadows, OrbitControls, MapControls } from "@react-three/drei";

export default function Scene() {
  const numberOfTrees = 36;

  const getOuterTreeScale = (index) => {
    if (index < 9) {
      return 5;
    }
    return 1.5;
  };

  const generateTrees = () => {
    const trees = [];
    const firstRadius = 9;
    const innerRadius = 14;
    const outerRadius = 20; // Radius of the circle

    // FIRST (INNERMOST) CIRCLE OF TREES
    for (let i = 0; i < numberOfTrees; i++) {
      const angle = (i * 2 * Math.PI) / numberOfTrees;
      const x = firstRadius * Math.cos(angle);
      const z = firstRadius * Math.sin(angle);
      const y = -1.5;

      trees.push(
        <Tree
          key={`first-${i}`}
          position={[x, y, z]}
          scale={1.25}
        />
      );
    }

    // INNER CIRCLE OF TREES
    for (let i = 0; i < numberOfTrees; i++) {
      const angle = (i * 2 * Math.PI) / numberOfTrees;
      const x = innerRadius * Math.cos(angle);
      const z = innerRadius * Math.sin(angle);
      const y = -1.5;

      trees.push(
        <Tree
          key={`inner-${i}`}
          position={[x, y, z]}
          scale={1.25}
        />
      );
    }

    // OUTER CIRCLE OF TREES
    for (let i = 0; i < numberOfTrees; i++) {
      // Calculate angle for each tree (in radians)
      const angle = (i * 2 * Math.PI) / numberOfTrees;

      // Calculate position using trigonometry
      const x = outerRadius * Math.cos(angle);
      const z = outerRadius * Math.sin(angle);
      const y = -1.5; // Consistent height for all trees

      trees.push(
        <Tree
          key={i}
          position={[x, y, z]}
          scale={getOuterTreeScale(i)}
        />
      );
    }
    return trees;
  }
  return <>
    <SoftShadows size={ 80 } samples={ 20 } focus={ 0 } />
    <OrbitControls />
    <MapControls />

    {generateTrees()}

    <ambientLight intensity={1} />
    <directionalLight
      position={[ 1, 3, 1.8]}
      intensity={ 4 }
      castShadow
      shadow-mapSize={[1024 * 3, 1024 * 3]}
      shadow-camera-top={ 4 }
      shadow-camera-right={ 4 }
      shadow-camera-bottom={ -3 }
      shadow-camera-left={ -2 }
      shadow-camera-near={ 0.5 }
      shadow-camera-far={ 50 }
    />
  </>
}
