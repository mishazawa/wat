import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useFrustumCulling } from "../utils/useFrustumCulling";
import type { ThreeElements } from "@react-three/fiber";

export type AnimatedModelProps = Prettify<
  Omit<Partial<ThreeElements["primitive"]>, "object"> & {
    meshSrc: string;
    animationName: string;
  }
>;

export function RiggedAnimatedModel({
  meshSrc,
  animationName,
  children,
  ...props
}: AnimatedModelProps) {
  const ref = useRef(null!);
  const { scene, animations } = useGLTF(meshSrc);
  const { actions } = useAnimations(animations, ref);

  useFrustumCulling(scene);

  useEffect(() => {
    if (actions[animationName]) {
      actions[animationName].reset().play();
    }
  }, [actions]);

  return (
    <primitive object={scene} ref={ref} frustumCulled={false} {...props}>
      {children}
    </primitive>
  );
}
