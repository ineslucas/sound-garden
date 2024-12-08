/* eslint-disable react/prop-types */

// CURRENTLY READING 9 VALUES FROM THE SENSOR //

// cross talk
// IIE sensors magazine
// when you do a read, add a 1 milisecond delay everytime you change a row,
// the arduino has to connect to the analog to digital converter
// There's only 1.
// before you add analog read of each row, add a delay.

// or look in

// high resistors = less noise but less sensitive // less responsitive.
 

import { useEffect, useState } from 'react';
import Tree from './Tree';
import { SoftShadows, OrbitControls, MapControls } from "@react-three/drei";

export default function Scene({ treeScales }) {
  // React's rendering cycle isn't automatically triggering updates when treeScalesRef.current changes.
  const [scales, setScales] = useState(treeScales);

  // Update scales when treeScales changes
  useEffect(() => {
    setScales(treeScales);
  }, [treeScales]);


  const numberOfTrees = 36;

  // Includes negative values....
  const mapSerialToScale = (value) => {
    // Ensure value is a number and has a default
      // 🌸 So, is this type check OR transforming it into a number in case it was a string?
    value = Number(value) || 0;

    // Map from 0-700 (sensor range) to 0-1 (scale range)
    const inputMin = 0;
    const inputMax = 700; // 🌸
    const scaleMin = 0.15;
    const scaleMax = 1.5;

    // Linear mapping
    const mappedValue = scaleMin + ((value - inputMin) * (scaleMax - scaleMin)) / (inputMax - inputMin);

    // Debug log to see the values
    // console.log('Input value:', value, 'Mapped value:', mappedValue);

    // Clamp between 0 and 1 but it was already clamped by the Arduino?
    return Math.max(scaleMin, Math.min(scaleMax, mappedValue));
  };

  const getTreeScale = (circleType, index) => {
    if (index < 9) {
      switch(circleType) {
        case 'first': return mapSerialToScale(treeScales[index]);
        case 'inner': return mapSerialToScale(treeScales[index + 9]);
        case 'outer': return mapSerialToScale(treeScales[index + 18]);
        default: return 1.5;
      }
    }
    return circleType === 'outer' ? 1.5 : 1.25;
  };

  // const getOuterTreeScale = (index) => {
  //   if (index < 9) {
  //     return 5;
  //   }
  //   return 1.5;
  // };

  const generateTrees = () => {
    const trees = [];
    const firstRadius = 9;
    const innerRadius = 14;
    const outerRadius = 20; // Radius of the circle

    // FIRST (INNERMOST) CIRCLE OF TREES
    for (let i = 0; i < numberOfTrees; i++) {
      const angle = (i * 2 * Math.PI) / numberOfTrees;
      // const x = firstRadius * Math.cos(angle);
      // const z = firstRadius * Math.sin(angle);
      // const y = -1.5;
      // same as prev.

      trees.push(
        <Tree
          key={`first-${i}`}
          position={[
            firstRadius * Math.cos(angle),
            -1.5,
            firstRadius * Math.sin(angle)
          ]}
          scale={getTreeScale('first', i)}
          // position={[x, y, z]}
          // scale={1.25}
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
          position={[
            innerRadius * Math.cos(angle),
            -1.5,
            innerRadius * Math.sin(angle)
          ]}
          scale={getTreeScale('inner', i)}

          // position={[x, y, z]}
          // scale={1.25}
        />
      );
    }

    // OUTER CIRCLE OF TREES
    for (let i = 0; i < numberOfTrees; i++) {
      // Calculate angle for each tree (in radians)
      const angle = (i * 2 * Math.PI) / numberOfTrees;

      // Calculate position using trigonometry
      // const x = outerRadius * Math.cos(angle);
      // const z = outerRadius * Math.sin(angle);
      // const y = -1.5; // Consistent height for all trees

      trees.push(
        <Tree
          key={i}
          // position={[x, y, z]}
          // scale={getOuterTreeScale(i)}
          position={[
            outerRadius * Math.cos(angle),
            -1.5,
            outerRadius * Math.sin(angle)
          ]}
          scale={getTreeScale('outer', i)}
        />
      );
    }
    return trees;
  }
  return <>
    {/* 3D SCENE CONTENT */}
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
