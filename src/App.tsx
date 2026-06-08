import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  Environment,
  Fisheye,
  Grid,
  PerspectiveCamera,
} from "@react-three/drei";

import "./vat/VatSkinningMaterial";
import TEST_MODEL_ANIMATED_GLTF from "./assets/001.destruction.exp_animated.glb";

import { RiggedAnimatedModel } from "./components/RiggedAnimatedModel";
import { Animator } from "./components/Animator";
import { VatSlider } from "./components/TimeSlider";

import ENV_MAP from "./assets/alte_veste_station_1k.hdr";

export default function App() {
  const [showRigged, setShowRigged] = useState(false);
  return (
    <>
      <Canvas>
        <Fisheye zoom={0}>
          <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
          <ambientLight intensity={Math.PI / 2} />

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
          <hemisphereLight intensity={0.5} color="white" groundColor="black" />
          <Environment
            files={ENV_MAP}
            ground={{ height: 10, radius: 40, scale: 500 }}
            background={false}
          />

          <Grid scale={100} />
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 18.5]}
            near={0.01}
            far={1000}
          />
        </Fisheye>
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
