import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stops drawing every instance of the tree `id` and keeps `treeIds` in step
 * with the instances that remain: `treeIds[i]` is still the id of the tree
 * drawn by instance `i`.
 *
 * removeThinInstance(forest, i) moves the last instance into slot i, so the
 * matching entry in `treeIds` is overwritten with the last id and then the
 * last entry is dropped. Matches are visited from the highest index down, so
 * an index that has not been visited yet is never moved out from under the loop.
 * If `id` is not in `treeIds`, nothing changes.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  for (let i = treeIds.length - 1; i >= 0; i--) {
    if (treeIds[i] !== id) continue;
    removeThinInstance(forest, i);
    const last = treeIds.length - 1;
    treeIds[i] = treeIds[last];
    treeIds.pop();
  }
}
