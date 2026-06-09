import { useGLTF } from "@react-three/drei";
import { type SkinnedMesh } from "three";
import { ATTRIBUTE_MAPPING } from "../constants";
import { useFindChildByName } from "../utils/useFindChildByName";
import { useFrustumCulling } from "../utils/useFrustumCulling";
import { useRenameGeometryAttrib } from "../utils/useRenameGeometryAttrib";
import type { ThreeElements } from "@react-three/fiber";

import { useTextureAnimation } from "../utils/useTextureAnimation";
import { VatMaterial } from "../vat/VatSkinningMaterial";
import { useUniforms } from "../utils/useUniforms";

type AnimatedModelProps = Prettify<
  Omit<Partial<ThreeElements["primitive"]>, "object"> & {
    meshSrc: string;
    animationSrc: string;
  }
>;

export function VatModel({
  meshSrc,
  animationSrc,
  ...props
}: AnimatedModelProps) {
  const { scene } = useGLTF(meshSrc);
  useFrustumCulling(scene);

  const [skin] = useFindChildByName<SkinnedMesh>(scene, "skin", [scene]);

  useRenameGeometryAttrib(skin, ATTRIBUTE_MAPPING);

  const uniforms = useTextureAnimation(30);

  return (
    skin && (
      <group {...props}>
        <skinnedMesh
          frustumCulled={false}
          geometry={skin.geometry}
          skeleton={skin.skeleton}
        >
          <VatMaterial
            animationSrc={animationSrc}
            uniforms={uniforms}
            numFrames={240}
            numBones={skin.skeleton.bones.length}
          />
        </skinnedMesh>
      </group>
    )
  );
}
