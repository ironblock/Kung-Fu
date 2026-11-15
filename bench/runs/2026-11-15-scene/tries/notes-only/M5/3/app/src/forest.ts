import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stops drawing every instance of the tree `id` and keeps `treeIds` in step
 * with the mesh's thin instances: afterwards `treeIds[i]` is the id of the
 * tree drawn by instance `i`.
 *
 * removeThinInstance moves the last instance into the freed slot, so we walk
 * the indices from the top down. When we reach index i, every index above i
 * is already a non-matching tree, so the element moved into slot i is also
 * kept, and nothing is skipped.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  for (let i = treeIds.length - 1; i >= 0; i--) {
    if (treeIds[i] !== id) continue;
    const last = treeIds.length - 1;
    removeThinInstance(forest, i);
    treeIds[i] = treeIds[last];
    treeIds.length = last;
  }
}
