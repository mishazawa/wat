import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  Color,
  FloatType,
  NearestFilter,
  NoColorSpace,
  Skeleton,
  SkinnedMesh,
  type Mesh,
} from "three";
import {
  CameraControls,
  Environment,
  Grid,
  useAnimations,
  useGLTF,
} from "@react-three/drei";

import { EXRLoader } from "three/examples/jsm/Addons.js";
import "./shaders/VatSkinningMaterial";
import anim_tex from "./assets/animation_soft.exr";
import TEST_MODEL_ANIMATED_GLTF from "./assets/pillars_combined.glb";
import TEST_MODEL_REST_GLTF from "./assets/pillars_rest.glb";
import { VatSkin, type VatUniforms } from "./shaders/VatSkinningMaterial";
import { degToRad } from "three/src/math/MathUtils.js";

function ModelAnimated() {
  const ref = useRef(null!);
  const { scene, animations } = useGLTF(TEST_MODEL_ANIMATED_GLTF);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    scene.traverse((o) => {
      const child = o as Mesh;
      if (child.isMesh) {
        child.frustumCulled = false;
      }
    });

    if (actions.animation) {
      actions.animation.reset().play();
    }
  }, [scene, actions]);

  return (
    <primitive
      position={[2.5, 0, 0]}
      object={scene}
      ref={ref}
      frustumCulled={false}
    >
      <meshBasicMaterial attach="material" color="hotpink" />
    </primitive>
  );
}

function genUniform() {
  return {
    uVatTexture: { value: null },
    uFrame: { value: 1 },
    uTotalFrames: { value: 1 },
    uNumBones: { value: 1 },
    uDiffuse: { value: new Color(0xaaffee) },
  };
}

function ModelRest() {
  const ref = useRef(null!);
  const refSkel = useRef(null!);

  const uniforms = useRef<VatUniforms>(genUniform());

  const { scene } = useGLTF(TEST_MODEL_REST_GLTF);

  useEffect(() => {
    scene.traverse((o) => {
      const child = o as Mesh;
      if (child.isMesh) {
        child.frustumCulled = false;

        console.log(`Mesh: ${child.name}`);
        const attributes = child.geometry.attributes;

        Object.keys(attributes).forEach((attrName) => {
          const attr = attributes[attrName];

          // itemSize: 1 = SCALAR, 2 = VEC2, 3 = VEC3, 4 = VEC4
          const itemSize = attr.itemSize;

          // type: Float32Array, Uint16Array, Int8Array, etc.
          const arrayType = attr.array.constructor.name;

          let gltfType = `VEC${itemSize}`;
          if (itemSize === 1) gltfType = "SCALAR";

          console.log(`  - ${attrName}: ${gltfType} (${arrayType})`);
        });
      }
    });
  }, [scene]);

  const [skeleton]: Skeleton[] = useMemo(
    () =>
      scene.children.filter(
        (child) => child.name === "root",
      ) as unknown as Skeleton[],
    [scene],
  );
  const [skin]: SkinnedMesh[] = useMemo(
    () =>
      scene.children.filter((child) => child.name === "skin") as SkinnedMesh[],
    [scene],
  );

  useLayoutEffect(() => {
    const geometry = skin.geometry;
    const oldAttribute = geometry.getAttribute("_bind_position");

    if (oldAttribute) {
      geometry.setAttribute("aVatBindPos", oldAttribute);
      geometry.deleteAttribute("_bind_position");
    }

    const oldIndex = geometry.getAttribute("_index");
    if (oldIndex) {
      geometry.setAttribute("aVatBoneIndex", oldIndex);
      geometry.deleteAttribute("_index");
    }
  }, [skin]);

  const texture = useLoader(EXRLoader, anim_tex, (loader) => {
    loader.setDataType(FloatType);
  });

  useEffect(() => {
    if (texture) {
      texture.colorSpace = NoColorSpace;
      texture.minFilter = NearestFilter;
      texture.magFilter = NearestFilter;
      texture.generateMipmaps = false;
      texture.flipY = false;
      texture.needsUpdate = true;

      const totalFrames = texture.image.height;
      const numBones = skin.skeleton.bones.length;
      uniforms.current.uVatTexture.value = texture;
      uniforms.current.uNumBones.value = numBones;
      uniforms.current.uTotalFrames.value = totalFrames;
    }
  }, [texture, skin]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const currentFrame =
      Math.floor(time * 30) % uniforms.current.uTotalFrames.value;

    uniforms.current.uFrame.value = currentFrame;
  });

  return (
    skeleton &&
    skin && (
      <group
        rotation={[degToRad(45), degToRad(90), degToRad(76)]}
        position={[-2.5, 0, 0]}
        ref={ref}
      >
        <primitive object={skeleton} ref={refSkel} />

        <skinnedMesh
          frustumCulled={false}
          geometry={skin.geometry}
          skeleton={skin.skeleton}
        >
          <VatSkin uniforms={uniforms} />
        </skinnedMesh>
      </group>
    )
  );
}

export default function App() {
  return (
    <Canvas camera={{ near: 0.01, far: 1000, position: [5, 3, 5] }}>
      <Suspense fallback={null}>
        <ModelAnimated />
      </Suspense>
      <Suspense fallback={null}>
        <ModelRest />
      </Suspense>
      <Environment preset="sunset" />
      <Grid scale={10} />
      <CameraControls />
    </Canvas>
  );
}
