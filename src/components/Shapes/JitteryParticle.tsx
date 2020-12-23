import React, { Suspense, useMemo, useRef } from "react";
import { useSphere } from "@react-three/cannon";
import { useJitterParticle } from "./useJitterParticle";
import { useFrame, useLoader } from "react-three-fiber";
import * as THREE from "three";
// https://discourse.threejs.org/t/there-is-no-gltfloader-in-three-module/16117/4
import { useMount } from "../../utils/utils";
import { useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { BufferGeometryLoader } from "three";
// import * as antibody from "./models/1bv1/scene.gltf";

const dummy = new THREE.Object3D();

const colors = [...new Array(1000)].map(() => "white");
const rpi = () => Math.random() * Math.PI;

// const FancyParticle = React.forwardRef((props, ref) => {
//   return <group ref={ref}>{props.children}</group>;
// });

const JitteryParticle = ({
  ChildParticle,
  scale,
  position = null,
  temperature,
  amount,
  ...rest
}) => {
  // const coords = useMemo(
  //   () => [...new Array(amount)].map(() => [rpi(), rpi(), rpi()]),
  //   [amount]
  // );

  // const worldRadius = useStore((state) => state.worldRadius);

  // https://codesandbox.io/s/may-with-60fps-your-web-site-run-xj31x?from-embed=&file=/src/index.js:297-1112

  const mesh = useRef(null as any);
  const ref = useRef(null as any);
  // const [mesh] = useSphere(() => ({
  //   // rotation: [-Math.PI / 2, 0, 0],
  //   mass: 1,
  //   position: position || getRandStartPosition(-worldRadius, worldRadius),
  // }));

  // const particleRef = useJitterParticle({
  //   jitterPosition: temperature,
  //   jitterRotation: 0.01,
  // });

  // const dummy = new THREE.Object3D();
  // useFrame((state) => {
  //   const t = state.clock.getElapsedTime();
  //   coords.forEach(([x, y, z], i) => {
  //     dummy.rotation.set(x + t, y + t, z + t);
  //     //       dummy.updateMatrix(void dummy.rotation.set(x + t, y + t, z + t))
  //     dummy.updateMatrix();
  //     mesh.current.setMatrixAt(i, dummy.matrix);
  //   });
  //   mesh.current.instanceMatrix.needsUpdate = true;
  // });

  // random start positions
  useMount(() => {
    if (!ref.current) {
      return;
    }
    dummy.position.set(0, 0, 0);
    ref.current.setMatrixAt(0, dummy.matrix);

    ref.current.instanceMatrix.needsUpdate = true;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(time / 4);
    ref.current.rotation.y = Math.sin(time / 2);
    let i = 0;
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++)
        for (let z = 0; z < 10; z++) {
          dummy.position.set(5 - x, 5 - y, 5 - z);
          dummy.rotation.y =
            Math.sin(x / 4 + time) +
            Math.sin(y / 4 + time) +
            Math.sin(z / 4 + time);
          dummy.rotation.z = dummy.rotation.y * 2;
          dummy.updateMatrix();
          ref.current.setMatrixAt(i++, dummy.matrix);
        }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  // Load async model
  // When we're here it's loaded, now compute vertex normals
  // useMemo(() => {
  //   geometry.computeVertexNormals()
  //   geometry.scale(0.5, 0.5, 0.5)
  // }, [geometry])
  // Compute per-frame instance positions
  // useFrame((state) => {
  //   const time = state.clock.getElapsedTime();
  //   ref.current.rotation.x = Math.sin(time / 4);
  //   ref.current.rotation.y = Math.sin(time / 2);
  //   let i = 0;
  //   for (let x = 0; x < 10; x++)
  //     for (let y = 0; y < 10; y++)
  //       for (let z = 0; z < 10; z++) {
  //         dummy.position.set(5 - x, 5 - y, 5 - z);
  //         dummy.rotation.y =
  //           Math.sin(x / 4 + time) +
  //           Math.sin(y / 4 + time) +
  //           Math.sin(z / 4 + time);
  //         dummy.rotation.z = dummy.rotation.y * 2;
  //         dummy.updateMatrix();
  //         ref.current.setMatrixAt(i++, dummy.matrix);
  //       }
  //   ref.current.instanceMatrix.needsUpdate = true;
  // });

  // const usedgltf = useGLTF("/public/models/SarsCov2/scene.gltf") as any;
  // console.log("🌟🚨 ~ usedgltf", usedgltf);
  // const { nodes } = usedgltf;
  const usedgltf = useGLTF("/models/SarsCov2/scene.gltf") as any;
  console.log("🌟🚨 ~ usedgltf", usedgltf);

  const geometry = usedgltf?.nodes?.["RNA__SARS-CoV-2_0"]?.geometry;
  const materials = usedgltf?.materials["SARS-CoV-2"];
  console.log("🌟🚨 ~ geometry", geometry);
  // console.log("🌟🚨 ~ geometry", geometry);

  // each instance must have only one geometry https://github.com/pmndrs/react-three-fiber/issues/574#issuecomment-703296449
  // <group ref={particleRef} {...rest}>

  return geometry ? (
    <instancedMesh
      ref={ref}
      args={[geometry, materials, Math.ceil(amount)]}
      renderOrder={2}
    ></instancedMesh>
  ) : null;
  // <instancedMesh
  //   ref={mesh}
  //   args={[null, null, amount]}
  //   renderOrder={2}
  //   // onPointerMove={(e) => setHovered(e.instanceId)}
  //   // onPointerOut={(e) => setHovered(undefined)}
  // >
  //   {/* <boxBufferGeometry attach="geometry" /> */}
  //   {/* <instancedBufferGeometry */}
  //   {/* <Suspense fallback={null}>
  //     <ChildParticle scale={[scale, scale, scale]} />
  //   </Suspense> */}
  //   <boxBufferGeometry attach="geometry" />
  //   <meshNormalMaterial attach="material" transparent opacity={1} />
  // </instancedMesh>
};

useGLTF.preload("/models/SarsCov2/scene.gltf");

export default JitteryParticle;
