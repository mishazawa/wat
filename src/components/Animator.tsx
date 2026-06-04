import { useRef } from "react";

import { useTextureAnimation } from "../utils/useTextureAnimation";
import {
  type VatUniforms,
  getDefaultUniforms,
  VatMaterial,
} from "../vat/VatSkinningMaterial";

import ANIM_TEX from "../assets/animation_soft.exr";
import TEST_MODEL_REST_GLTF from "../assets/pillars_rest.glb";
import { VatModel } from "./VatModel";

export function Animator() {
  const uniforms = useRef<VatUniforms>(getDefaultUniforms());
  useTextureAnimation(uniforms);

  return (
    <VatModel meshSrc={TEST_MODEL_REST_GLTF}>
      <VatMaterial animationSrc={ANIM_TEX} uniforms={uniforms} roughness={0} />
    </VatModel>
  );
}
