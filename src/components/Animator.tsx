import ANIM_TEX from "../assets/vat.exr";
import TEST_MODEL_REST_GLTF from "../assets/001.destruction.exp_static.glb";
import { VatModel } from "./VatModel";

export function Animator() {
  return <VatModel meshSrc={TEST_MODEL_REST_GLTF} animationSrc={ANIM_TEX} />;
}
