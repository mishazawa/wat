import {
  Color,
  DataTexture,
  FloatType,
  MeshPhysicalMaterial,
  NearestFilter,
  NoColorSpace,
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
};

type VatMaterialProps = Prettify<
  Partial<MeshPhysicalMaterial> & {
    animationSrc: string;
    uniforms: RefObject<VatUniforms>;
  }
>;

export function VatMaterial({
  uniforms,
  animationSrc,
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

      const totalFrames = texture.image.height;
      const numBones = texture.image.width / 2;
      uniforms.current.uVatTexture.value = texture;
      uniforms.current.uNumBones.value = numBones;
      uniforms.current.uTotalFrames.value = totalFrames;
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
  };
}
