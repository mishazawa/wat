import { Color, DataTexture, MeshPhysicalMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import VERT from "./vertex.glsl?raw";
import FRAG from "./fragment.glsl?raw";
import { type RefObject } from "react";

export type VatUniforms = {
  uVatTexture: { value: DataTexture | null };
  uFrame: { value: number };
  uTotalFrames: { value: number };
  uNumBones: { value: number };
  uDiffuse: { value: Color };
};

type VatSkinProps = {
  uniforms: RefObject<VatUniforms>;
};

export function VatSkin({ uniforms }: VatSkinProps) {
  return (
    <CustomShaderMaterial
      uniforms={uniforms.current}
      baseMaterial={MeshPhysicalMaterial}
      vertexShader={VERT}
      fragmentShader={FRAG}
    />
  );
}
