/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei/useGLTF";

export default function Model(props) {
  const group = useRef();
  const { nodes } = useGLTF(
    "/models/viruses/Penaeus vannamei nodavirus_40_radial.glb"
  ) as any;
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        material={nodes["6ab5cif_assembly_1_A_Gaussian_surface"].material}
        geometry={nodes["6ab5cif_assembly_1_A_Gaussian_surface"].geometry}
      />
    </group>
  );
}

// useGLTF.preload("/models/viruses/Penaeus vannamei nodavirus_40_radial.glb");
