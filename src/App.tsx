import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, Grid } from "@react-three/drei";

import "./vat/VatSkinningMaterial";
import TEST_MODEL_ANIMATED_GLTF from "./assets/pillars_combined.glb";

import { RiggedAnimatedModel } from "./components/RiggedAnimatedModel";
import { Animator } from "./components/Animator";
import { VatSlider } from "./components/TimeSlider";

export default function App() {
  const [showRigged, setShowRigged] = useState(false);
  return (
    <>
      <Canvas camera={{ near: 0.01, far: 1000, position: [10, 7, 10] }}>
        <Suspense fallback={null}>
          {showRigged ? (
            <RiggedAnimatedModel
              meshSrc={TEST_MODEL_ANIMATED_GLTF}
              animationName="animation"
            />
          ) : (
            <Animator />
          )}
        </Suspense>
        <Environment preset="warehouse" />
        <Grid scale={100} />
        <CameraControls />
      </Canvas>
      <div className="controls-overlay">
        <button
          onClick={() => setShowRigged((prev) => !prev)}
          className="toggle-btn"
        >
          Toggle Model ({showRigged ? "Rigged" : "VAT"})
        </button>
      </div>
      {showRigged ? null : <VatSlider />}
    </>
  );
}
