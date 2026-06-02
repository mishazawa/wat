import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  BufferAttribute,
  Color,
  FloatType,
  NearestFilter,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  type Mesh,
} from "three";
import {
  CameraControls,
  Environment,
  Grid,
  useAnimations,
  useFBX,
  useHelper,
} from "@react-three/drei";

import "./shaders/VatSkinningMaterial";
import P_tex from "./assets/P.exr";
import Q_tex from "./assets/Q.exr";
import TEST_MODEL_ANIMATED from "./assets/test_destruction_combined.fbx";
import TEST_MODEL_REST from "./assets/test_destruction_rest.fbx";
import { EXRLoader } from "three/examples/jsm/Addons.js";
import { VatSkin, type VatUniforms } from "./shaders/VatSkinningMaterial";
import { TMP_MAPPING } from "./constants";

function ModelAnimated() {
  const ref = useRef(null!);
  const fbx = useFBX(TEST_MODEL_ANIMATED);
  const { actions } = useAnimations(fbx.animations, ref);
  useHelper(fbx && ref, SkeletonHelper);
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
      position={[2.5, 0, 0]}
      object={fbx}
      ref={ref}
      frustumCulled={false}
    >
      <meshBasicMaterial attach="material" color="hotpink" />
    </primitive>
  );
}

function genUniform() {
  return {
    uVatTexturePos: { value: null },
    uVatTextureRot: { value: null },
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

  const { children } = useFBX(TEST_MODEL_REST);

  const [skeleton]: Skeleton[] = useMemo(
    () =>
      children.filter(
        (child) => child.name === "root",
      ) as unknown as Skeleton[],
    [children],
  );
  const [skin]: SkinnedMesh[] = useMemo(
    () => children.filter((child) => child.name === "box") as SkinnedMesh[],
    [children],
  );

  useLayoutEffect(() => {
    if (!skin) return;

    const geometry = skin.geometry;
    const originalSkinIndex = geometry.attributes.skinIndex;
    const meshBones = skin.skeleton.bones;

    // Safety checks - ensure skinIndex exists and we haven't already injected the attributes
    if (
      !originalSkinIndex ||
      geometry.attributes.aVatBoneIndex ||
      geometry.attributes.aVatBindPos
    )
      return;

    // 1. Create a dictionary mapping: Bone_Name -> EXR_Column_Index
    const nameToExrColumn = new Map<string, number>();
    TMP_MAPPING.forEach(([exrColumn, boneName]) => {
      nameToExrColumn.set(boneName, exrColumn);
    });

    // 2. Build lookups mapping: ThreeJS_Bone_Index -> EXR_Column & Rest Position
    const indexToExrColumn: { [key: number]: number } = {};
    const indexToBindPos: {
      [key: number]: { x: number; y: number; z: number };
    } = {};

    meshBones.forEach((bone, meshIndex) => {
      const exrColumn = nameToExrColumn.get(bone.name) ?? 0;
      indexToExrColumn[meshIndex] = exrColumn;

      // Capture the static local/rest position of the bone
      // Since your hierarchy is flat under the root, bone.position IS its absolute rest coordinate
      indexToBindPos[meshIndex] = {
        x: bone.position.x,
        y: bone.position.y,
        z: bone.position.z,
      };
    });

    // 3. Allocate flat arrays for BOTH custom attributes
    const vertexCount = originalSkinIndex.count;
    const vatIndices = new Float32Array(vertexCount); // 1 float per vertex
    const vatBindPositions = new Float32Array(vertexCount * 3); // 3 floats (X, Y, Z) per vertex

    // 4. Map data vertex by vertex using the primary bone index (.getX)
    for (let i = 0; i < vertexCount; i++) {
      const primaryMeshBoneIndex = originalSkinIndex.getX(i);

      // Write the corrected EXR column index
      vatIndices[i] = indexToExrColumn[primaryMeshBoneIndex] ?? 0;

      // Look up the matching rest position (fallback to 0,0,0 if not found)
      const bindPos = indexToBindPos[primaryMeshBoneIndex] ?? {
        x: 0,
        y: 0,
        z: 0,
      };
      const idx3 = i * 3;
      vatBindPositions[idx3] = bindPos.x;
      vatBindPositions[idx3 + 1] = bindPos.y;
      vatBindPositions[idx3 + 2] = bindPos.z;
    }

    // 5. Attach both single-channel and vector attributes directly to the geometry
    geometry.setAttribute("aVatBoneIndex", new BufferAttribute(vatIndices, 1));
    geometry.setAttribute(
      "aVatBindPos",
      new BufferAttribute(vatBindPositions, 3),
    );

    console.log(
      "Successfully injected optimized aVatBoneIndex (size 1) and aVatBindPos (size 3) attributes.",
    );
  }, [skin, skeleton]);

  useHelper(refSkel, SkeletonHelper);
  const texturePos = useLoader(EXRLoader, P_tex, (loader) => {
    loader.setDataType(FloatType);
  });

  const textureRot = useLoader(EXRLoader, Q_tex, (loader) => {
    loader.setDataType(FloatType);
  });

  useEffect(() => {
    if (texturePos && textureRot) {
      texturePos.minFilter = NearestFilter;
      texturePos.magFilter = NearestFilter;
      texturePos.generateMipmaps = false;
      texturePos.flipY = false;

      textureRot.minFilter = NearestFilter;
      textureRot.magFilter = NearestFilter;
      textureRot.generateMipmaps = false;
      textureRot.flipY = false;

      const totalFrames = texturePos.image.height;
      const numBones = texturePos.image.width;

      uniforms.current.uVatTexturePos.value = texturePos;
      uniforms.current.uVatTextureRot.value = textureRot;
      uniforms.current.uNumBones.value = numBones;
      uniforms.current.uTotalFrames.value = totalFrames;
    }
  }, [texturePos, textureRot]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const currentFrame =
      Math.floor(time * 60) % uniforms.current.uTotalFrames.value;

    uniforms.current.uFrame.value = currentFrame;
  });

  return (
    skeleton &&
    skin && (
      <group scale={0.01} position={[-2.5, 0, 0]} ref={ref}>
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
