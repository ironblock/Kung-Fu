import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

// removeThinInstance swap-removes: the last instance's matrix is copied into
// the removed slot, and the last slot is dropped. Mirror that in treeIds so
// treeIds[i] keeps naming the tree drawn by instance i.
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  let i = treeIds.indexOf(id);
  while (i >= 0) {
    const last = treeIds.length - 1;
    removeThinInstance(forest, i);
    treeIds[i] = treeIds[last];
    treeIds.pop();
    i = treeIds.indexOf(id);
  }
}
