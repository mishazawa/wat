import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, Grid } from "@react-three/drei";

import "./vat/VatSkinningMaterial";
import TEST_MODEL_ANIMATED_GLTF from "./assets/pillars_combined.glb";

import { RiggedAnimatedModel } from "./components/RiggedAnimatedModel";
import { Animator } from "./components/Animator";

export default function App() {
  return (
    <Canvas camera={{ near: 0.01, far: 1000, position: [5, 3, 5] }}>
      <Suspense fallback={null}>
        <RiggedAnimatedModel
          meshSrc={TEST_MODEL_ANIMATED_GLTF}
          animationName="animation"
          position={[0, 1.5, 0]}
          scale={5}
          rotation={[0, Math.PI / 4, 0]}
        />
      </Suspense>
      <Suspense fallback={null}>
        <Animator />
      </Suspense>
      <Environment preset="warehouse" />
      <Grid scale={100} />
      <CameraControls />
    </Canvas>
  );
}
