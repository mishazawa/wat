import { useEffect } from "react";
import type { Mesh, Object3D } from "three";

export function useFrustumCulling(scene: Object3D, value: boolean = false) {
  useEffect(() => {
    scene.traverse((o) => {
      const child = o as Mesh;
      if (child.isMesh) {
        child.frustumCulled = value;
      }
    });
  }, [scene, value]);
}
