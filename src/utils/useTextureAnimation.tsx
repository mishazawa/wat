import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { VatUniforms } from "../vat/VatSkinningMaterial";
import { DEFAULT_FPS } from "../constants";
import { useStore } from "../vat/store";

export function useTextureAnimation(
  uniforms: RefObject<VatUniforms>,
  fps: number = DEFAULT_FPS,
) {
  const setProgress = useStore((state) => state.setProgress);

  useFrame((state) => {
    const { isPaused } = useStore.getState();
    if (isPaused) return;

    let time = state.clock.getElapsedTime();

    let currentFrame = 0;

    currentFrame = loopMode(time, uniforms.current.uTotalFrames.value, fps);
    currentFrame /= uniforms.current.uTotalFrames.value;

    setProgress(currentFrame);
  });

  useFrame(() => {
    const { progress } = useStore.getState();
    const totalFrames = uniforms.current.uTotalFrames.value;
    let currentFrame = progress * totalFrames;
    currentFrame = Math.floor(currentFrame);
    currentFrame = Math.min(currentFrame, totalFrames - 1);
    uniforms.current.uFrame.value = currentFrame;
  });
}

function loopMode(time: number, total: number, fps: number = DEFAULT_FPS) {
  return Math.floor(time * fps) % total;
}
