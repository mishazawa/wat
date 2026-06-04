import { useMemo, type DependencyList } from "react";
import type { Object3D } from "three";

export function useFindChildByName<T>(
  parent: { children: Object3D[] } | undefined | null,
  nameToFind: string,
  deps: DependencyList = [],
): [T | undefined] {
  return useMemo(() => {
    if (!parent?.children) return [undefined];

    const found = parent.children.find((child) => child.name === nameToFind);
    return [found as T];
    // Spread deps so React can track changes properly
  }, [parent, nameToFind, ...deps]);
}
