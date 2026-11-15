import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id and keeps `treeIds` in step with
 * the instances the mesh still draws.
 *
 * `removeThinInstance` moves the last instance into the freed slot, so the
 * same swap-and-pop is applied to `treeIds`. Matching slots are removed from
 * the highest index down: each removal then only moves an instance that is
 * not itself waiting to be removed, so no slot is missed or double-counted.
 * An id that is not in the list changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  const hits: number[] = [];
  for (let i = treeIds.length - 1; i >= 0; i--) {
    if (treeIds[i] === id) hits.push(i);
  }

  for (const i of hits) {
    const last = treeIds.length - 1;
    removeThinInstance(forest, i);
    treeIds[i] = treeIds[last];
    treeIds.pop();
  }
}
