import React, { Suspense, useEffect } from "react";
import { Physics } from "@react-three/cannon";
import { OrbitControls } from "@react-three/drei";
import { Lighting } from "./Lighting";
import { Walls } from "../Walls";
import { PHYSICS_PROPS } from "../../utils/PHYSICS_PROPS";
import { Water } from "../Water";
import { ScaleIndicator } from "../Sliders/ScaleIndicator";
import { SelectedParticleDisplay } from "../SelectedParticle/SelectedParticleDisplay";
import CellsModels from "../CellAndAntibodyButtons/CellsModels";
import Game from "../Game/Game";
import { useAudioTrack } from "../music/useAudioTrack";
import { useSpring, a } from "react-spring/three";
import { useCameraY } from "./useCameraY";

const Scene = () => {
  // useCameraWobble();
  return (
    <Suspense fallback={null}>
      <AudioTrack />
      <OrbitControls />
      <PhysicsScene />
      <Lighting />
      {/* <Effects /> */}
    </Suspense>
  );
};

function PhysicsScene() {
  const newY = useCameraY();

  const springDownOnWaveChange = useSpring({ position: [0, newY, 0] });

  return (
    <a.group position={springDownOnWaveChange.position}>
      <Physics {...PHYSICS_PROPS}>
        <Walls />
        <Water />
        <ScaleIndicator />
        <Game />
        <SelectedParticleDisplay />
        <CellsModels />
      </Physics>
    </a.group>
  );
}

function AudioTrack() {
  // audio track
  useAudioTrack();
  return null;
}

// PROTEINS.forEach(({ pathToGLTF }) => // useGLTF.preload(pathToGLTF));

export default Scene;

// function useCameraWobble() {
//   useFrame(
//     ({
//       active,
//       aspect,
//       camera,
//       captured,
//       clock,
//       colorManagement,
//       concurrent,
//       events,
//       forceResize,
//       frames,
//       gl,
//       initialClick,
//       initialHits,
//       intersect,
//       invalidate,
//       invalidateFrameloop,
//       manual,
//       mouse,
//       noEvents,
//       pointer,
//       raycaster,
//       ready,
//       scene,
//       setDefaultCamera,
//       size,
//       subscribe,
//       subscribers,
//       viewport,
//       vr,
//     }) => {
//       const { x, y, z } = camera.position;
//       console.log("🌟🚨 ~ useCameraWobble ~ noise(1)", noise(1));
//       const jitter = 0.0000001;
//       const pb = perlinBetween(-jitter, jitter);
//       console.log("🌟🚨 ~ useCameraWobble ~ pb", pb);
//       camera.position.set(
//         x,
//         y,
//         z
//         // x + perlinBetween(-jitter, jitter),
//         // y + perlinBetween(-jitter, jitter),
//         // z + perlinBetween(-jitter, jitter)
//       );
//     }
//   );
// }

// function perlinBetween(min, max) {
//   return noise(max - min) + min;
// }
