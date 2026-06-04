import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { VatUniforms } from "../vat/VatSkinningMaterial";
import { DEFAULT_FPS } from "../constants";
import { useStore } from "../vat/store";

export function useTextureAnimation(uniforms: RefObject<VatUniforms>) {
  const setProgress = useStore((state) => state.setProgress);

  useFrame((state) => {
    const { isPaused } = useStore.getState();
    if (isPaused) return;

    let time = state.clock.getElapsedTime();

    let currentFrame = 0;

    currentFrame = loopMode(time, uniforms.current.uTotalFrames.value);
    currentFrame /= uniforms.current.uTotalFrames.value;

    setProgress(currentFrame);
  });

  useFrame(() => {
    const { progress } = useStore.getState();
    let currentFrame = uniforms.current.uTotalFrames.value * progress;
    uniforms.current.uFrame.value = currentFrame;
  });
}

function loopMode(time: number, total: number, fps: number = DEFAULT_FPS) {
  return Math.floor(time * fps) % total;
}
