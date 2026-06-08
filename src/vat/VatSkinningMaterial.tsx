import {
  Color,
  DataTexture,
  FloatType,
  MeshPhysicalMaterial,
  NearestFilter,
  NoColorSpace,
  Vector2,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import VERT from "./shaders/vertex.glsl?raw";
import FRAG from "./shaders/fragment.glsl?raw";
import { useEffect, type RefObject } from "react";
import { useLoader } from "@react-three/fiber";
import { EXRLoader } from "three/examples/jsm/Addons.js";

export type VatUniforms = {
  uVatTexture: { value: DataTexture | null };
  uFrame: { value: number };
  uTotalFrames: { value: number };
  uNumBones: { value: number };
  uDiffuse: { value: Color };
  uTexDim: { value: Vector2 };
  uStride: { value: number };
};

type VatMaterialProps = Prettify<
  Partial<MeshPhysicalMaterial> & {
    animationSrc: string;
    numFrames: number;
    numBones: number;
    uniforms: RefObject<VatUniforms>;
  }
>;

export function VatMaterial({
  uniforms,
  animationSrc,
  numFrames,
  numBones,
  ...props
}: VatMaterialProps) {
  const texture: DataTexture = useLoader(EXRLoader, animationSrc, (loader) => {
    loader.setDataType(FloatType);
  }) as DataTexture;

  useEffect(() => {
    if (texture) {
      texture.colorSpace = NoColorSpace;
      texture.minFilter = NearestFilter;
      texture.magFilter = NearestFilter;
      texture.generateMipmaps = false;
      texture.flipY = false;
      texture.needsUpdate = true;

      uniforms.current.uTexDim.value = new Vector2(
        texture.image.width,
        texture.image.height,
      );

      uniforms.current.uVatTexture.value = texture;
      uniforms.current.uNumBones.value = numBones;
      uniforms.current.uStride.value = Math.ceil(
        (numBones * 2) / texture.image.width,
      );
      uniforms.current.uTotalFrames.value = Math.floor(
        texture.image.height / uniforms.current.uStride.value,
      );
      uniforms.current.uTotalFrames.value = numFrames;
    }
  }, [texture]);

  return (
    <CustomShaderMaterial
      uniforms={uniforms.current}
      baseMaterial={MeshPhysicalMaterial}
      vertexShader={VERT}
      fragmentShader={FRAG}
      {...props}
    />
  );
}

export function getDefaultUniforms() {
  return {
    uVatTexture: { value: null },
    uFrame: { value: 1 },
    uTotalFrames: { value: 1 },
    uNumBones: { value: 1 },
    uDiffuse: { value: new Color(0xaaffee) },
    uTexDim: { value: new Vector2(1, 1) },
    uStride: { value: 1 },
  };
}
