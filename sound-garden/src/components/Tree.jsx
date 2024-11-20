import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Tree(props) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/tree.gltf')

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh receiveShadow castShadow geometry={nodes.Tree.geometry} material={materials['wood.005']} >
      <mesh receiveShadow castShadow geometry={nodes.Cube004.geometry} material={materials['tree.004']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube008.geometry} material={materials['tree.008']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube012.geometry} material={materials['tree.012']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube.geometry} material={materials['tree.001']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube002.geometry} material={materials['tree.002']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube003.geometry} material={materials['tree.003']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube006.geometry} material={materials['tree.006']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube009.geometry} material={materials['tree.009']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube005.geometry} material={materials['tree.005']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube007.geometry} material={materials['tree.007']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube010.geometry} material={materials['tree.010']} />
      <mesh receiveShadow castShadow geometry={nodes.Cube025.geometry} material={materials.tree} />
      <mesh receiveShadow castShadow geometry={nodes.Cube011.geometry} material={materials['tree.011']} />
      </mesh>
    </group>
  )
}

useGLTF.preload("./tree.gltf")
