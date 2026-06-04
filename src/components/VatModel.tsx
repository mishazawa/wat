import { useGLTF } from "@react-three/drei";
import type { Skeleton, SkinnedMesh } from "three";
import { ATTRIBUTE_MAPPING } from "../constants";
import { useFindChildByName } from "../utils/useFindChildByName";
import { useFrustumCulling } from "../utils/useFrustumCulling";
import { useRenameGeometryAttrib } from "../utils/useRenameGeometryAttrib";
import type { ThreeElements } from "@react-three/fiber";

type AnimatedModelProps = Prettify<
  Omit<Partial<ThreeElements["primitive"]>, "object"> & {
    meshSrc: string;
  }
>;

export function VatModel({ meshSrc, children, ...props }: AnimatedModelProps) {
  const { scene } = useGLTF(meshSrc);
  useFrustumCulling(scene);

  const [skeleton] = useFindChildByName<Skeleton>(scene, "root", [scene]);
  const [skin] = useFindChildByName<SkinnedMesh>(scene, "skin", [scene]);

  useRenameGeometryAttrib(skin, ATTRIBUTE_MAPPING);

  return (
    skeleton &&
    skin && (
      <group {...props}>
        <primitive object={skeleton} />
        <skinnedMesh
          frustumCulled={false}
          geometry={skin.geometry}
          skeleton={skin.skeleton}
        >
          {children}
        </skinnedMesh>
      </group>
    )
  );
}
