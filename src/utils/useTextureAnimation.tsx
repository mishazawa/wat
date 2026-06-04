import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { VatUniforms } from "../vat/VatSkinningMaterial";
import { DEFAULT_FPS, VAT_MODE, type VatMode } from "../constants";

export function useTextureAnimation(
  uniforms: RefObject<VatUniforms>,
  mode: VatMode,
) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    let currentFrame = 0; //stopped

    if (mode === VAT_MODE.ONE_SHOT)
      currentFrame = Math.floor(time * DEFAULT_FPS);
    if (mode === VAT_MODE.LOOP)
      currentFrame = loopMode(time, uniforms.current.uTotalFrames.value);

    uniforms.current.uFrame.value = currentFrame;
  });
}

function loopMode(time: number, total: number, fps: number = DEFAULT_FPS) {
  return Math.floor(time * fps) % total;
}
