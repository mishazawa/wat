import { useLayoutEffect } from "react";
import type { BufferGeometry, SkinnedMesh } from "three";

export function useRenameGeometryAttrib(
  skin: SkinnedMesh | undefined,
  map: Record<string, string>,
) {
  useLayoutEffect(() => {
    if (!skin) return;
    const geometry = skin.geometry;
    Object.entries(map).forEach((v) => renameAttr(geometry, ...v));
  }, [skin]);
}

function renameAttr(
  geo: BufferGeometry,
  src: string,
  dst: string,
  rm: boolean = true,
) {
  const oldAttribute = geo.getAttribute(src);
  if (!oldAttribute) return;
  geo.setAttribute(dst, oldAttribute);
  if (rm) geo.deleteAttribute(src);
}
