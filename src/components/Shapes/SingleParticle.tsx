import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useJitterParticle } from "./useJitterParticle";
import { useStore } from "../../store";
import * as THREE from "three";
import { usePauseUnpause } from "./usePauseUnpause";
import { useChangeVelocityWhenTemperatureChanges } from "./useChangeVelocityWhenTemperatureChanges";
import { useMount } from "../../utils/utils";
import { usePrevious } from "../../utils/hooks";
import { CEILING_HEIGHT_MULTIPLIER } from "../Walls";
import styled from "styled-components/macro";
import { HTML } from "@react-three/drei";

export type ParticleProps = {
  position: [number, number, number];
  Component: ReactNode;
  mass: number;
  numIcosahedronFaces: number;
  radius: number;
  interactive: boolean;
  lifespan?: number | null;
};
/** Particle which can interact with others, or not (passes right through them) */
export function SingleParticle(props: ParticleProps) {
  const Particle = props.interactive
    ? InteractiveParticle
    : NonInteractiveParticle;
  return <Particle {...props} />;
}
/** interacts with other particles using @react-three/cannon */
function InteractiveParticle(props) {
  const {
    position,
    Component,
    mass,
    numIcosahedronFaces,
    lifespan = null,
  } = props;
  const prevPosition: any = usePrevious(position);

  const set = useStore((s) => s.set);
  const scale = useStore((s) => s.scale);
  const isTooltipMaximized = useStore((s) => s.isTooltipMaximized);
  const selectedProtein = useStore((s) => s.selectedProtein);
  const isSelectedProtein =
    selectedProtein && selectedProtein.name === props.name;

  // each virus has a polyhedron shape, usually icosahedron (20 faces)
  // this shape determines how it bumps into other particles
  // https://codesandbox.io/s/r3f-convex-polyhedron-cnm0s?from-embed=&file=/src/index.js:1639-1642
  const detail = Math.floor(numIcosahedronFaces / 20);
  const volumeOfSphere = (4 / 3) * Math.PI * props.radius ** 3;
  const mockMass = 10 ** -5 * volumeOfSphere;

  const [ref, api] = useConvexPolyhedron(() => ({
    // TODO: accurate mass data from PDB --> need to multiply by number of residues or something else? doesn't seem right
    mass: mockMass, // approximate mass using volume of a sphere equation
    position,
    // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronBufferGeometry
    args: new THREE.IcosahedronGeometry(1, detail),
  }));

  const [isOffscreen, setIsOffscreen] = useState(false);

  useLifespan(lifespan, setIsOffscreen, isOffscreen, api, ref, prevPosition);

  usePauseUnpause({
    api,
  });

  // ! conflicts with useLifespan() ?
  // useJitterParticle({
  //   mass,
  //   ref,
  //   api,
  // });

  // when temperature changes, change particle velocity
  useChangeVelocityWhenTemperatureChanges({ mass, api });

  const handleSetSelectedProtein = () =>
    set({ selectedProtein: { ...props, api } });

  const pointerDownTime = useRef(0);
  // if we mousedown AND mouseup over the same particle very quickly, select it
  const handlePointerDown = () => {
    pointerDownTime.current = Date.now();
  };
  const handlePointerUp = () => {
    const timeSincePointerDown = Date.now() - pointerDownTime.current;
    if (timeSincePointerDown < 300) {
      handleSetSelectedProtein();
    }
  };

  return (
    <mesh
      ref={ref}
      scale={[scale, scale, scale]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {isSelectedProtein && !isTooltipMaximized ? <HighlightParticle /> : null}
      <Component />
    </mesh>
  );
}

const CircleOutline = styled.div`
  border: 2px solid #ff4775;
  box-sizing: border-box;
  border-radius: 50%;
  width: ${(props) => props.radius * 2}px;
  height: ${(props) => props.radius * 2}px;
  margin-left: ${(props) => -props.radius}px;
  margin-top: ${(props) => -props.radius}px;
`;
function HighlightParticle() {
  const selectedProtein = useStore((s) => s.selectedProtein);
  const scale = useStore((s) => s.scale);
  return selectedProtein ? (
    <HTML>
      <CircleOutline radius={selectedProtein.radius * scale * 70} />
    </HTML>
  ) : null;
}
/** lifespan: set a decay timer on mount (move off-screen to "unmount")
 * TODO: slow decay opacity out animation
 */
function useLifespan(
  lifespan: any,
  setIsOffscreen: React.Dispatch<React.SetStateAction<boolean>>,
  isOffscreen: boolean,
  api,
  ref: React.MutableRefObject<THREE.Object3D>,
  prevPosition: any
) {
  const worldRadius = useStore((s) => s.worldRadius);

  useMount(() => {
    if (lifespan) {
      window.setTimeout(() => {
        setIsOffscreen(true);
      }, lifespan);
    }
  });

  // remove or add the particle back
  useEffect(() => {
    console.log("🌟🚨 ~ useEffect ~ isOffscreen", isOffscreen);
    if (isOffscreen) {
      console.log("🌟🚨 ~ useEffect ~ api", api);
      console.log("🌟🚨 ~ useEffect ~ ref", ref);
      // need to take the lid off momentarily to achieve this?
      // TODO: make walls height ~infinite instead?
      // set({ isRoofOn: false });
      const ceilingHeight = worldRadius * CEILING_HEIGHT_MULTIPLIER;
      setTimeout(() => {
        api.position.set(
          Math.random() * 0.5,
          ceilingHeight,
          Math.random() * 0.5
        );
        api.velocity.set(0, 0, 0);
      }, 0);
      // setTimeout(() => {
      //   set({ isRoofOn: true });
      // }, 1);
    } else if (prevPosition?.[0]) {
      api.position.set(prevPosition[0], prevPosition[1], prevPosition[2]);
      // ? api.velocity.set(0, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffscreen]);
}

/** hide particle if too big or too small */
export function useShouldRenderParticle(radius: number) {
  const scale = useStore((s) => s.scale);
  const worldRadius = useStore((s) => s.worldRadius);

  return getShouldRenderParticle(scale, radius, worldRadius);
}

const MIN_RADIUS = 5;
const MAX_RADIUS = 20;
export function getShouldRenderParticle(
  scale: number,
  radius: number,
  worldRadius: number
) {
  const particleSize = scale * radius;
  const tooBigToRender = particleSize > worldRadius / MIN_RADIUS;
  const tooSmallToRender = particleSize < worldRadius / MAX_RADIUS;
  return !(tooBigToRender || tooSmallToRender);
}

/** doesn't interact with other particles (passes through them) */
function NonInteractiveParticle({
  pathToGLTF,
  mass,
  position,
  Component,
  numIcosahedronFaces,
  pathToImage,
}) {
  const ref = useRef();
  useJitterParticle({
    mass,
    ref,
  });
  const scale = useStore((state) => state.scale);

  return (
    <mesh
      frustumCulled={true}
      renderOrder={3}
      ref={ref}
      scale={[scale, scale, scale]}
      position={position}
    >
      <Component />
    </mesh>
  );
}
