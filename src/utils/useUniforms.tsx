import { useRef } from "react";
import { Color, Vector2 } from "three";
import type { VatUniforms } from "../vat/VatSkinningMaterial";

export function useUniforms() {
  return useRef<VatUniforms>(getDefaultUniforms());
}

function getDefaultUniforms() {
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
