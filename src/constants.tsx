export const ATTRIBUTE_MAPPING: Record<string, string> = {
  _bind_position: "aVatBindPos",
  _index: "aVatBoneIndex",
};

export const VAT_MODE = {
  LOOP: "VAT_LOOP",
  ONE_SHOT: "VAT_ONE_SHOT",
} as const;

export type VatMode = (typeof VAT_MODE)[keyof typeof VAT_MODE];

export const DEFAULT_FPS = 24;
