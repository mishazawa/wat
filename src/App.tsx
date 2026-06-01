import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  Environment,
  Grid,
  useAnimations,
  useFBX,
} from "@react-three/drei";
import MODEL from "./assets/test_destruction_combined.fbx";
import { type Mesh } from "three";

function Model() {
  const ref = useRef(null!);
  const fbx = useFBX(MODEL);
  const { actions } = useAnimations(fbx.animations, ref);

  useEffect(() => {
    fbx.traverse((o) => {
      const child = o as Mesh;
      if (child.isMesh) {
        child.frustumCulled = false;
      }
    });

    if (actions.animation) {
      actions.animation.reset().play();
    }
  }, [fbx, actions]);

  return (
    <primitive
      scale={[0.01, 0.01, 0.01]}
      object={fbx}
      ref={ref}
      frustumCulled={false}
    >
      <meshStandardMaterial />
    </primitive>
  );
}

export default function App() {
  return (
    <Canvas camera={{ near: 0.01, far: 1000, position: [5, 3, 5] }}>
      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <Environment preset="sunset" />
      <Grid scale={10} />
      <CameraControls />
    </Canvas>
  );
}
