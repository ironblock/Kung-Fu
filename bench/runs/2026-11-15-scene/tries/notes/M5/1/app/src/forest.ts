import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id and keeps `treeIds` in step with
 * the mesh's thin instances: `treeIds[i]` names the tree drawn by instance `i`.
 *
 * `removeThinInstance` moves the last instance into the removed slot, so the
 * same move is mirrored in `treeIds`. Every instance matching `id` is removed,
 * processed from the highest index down so that the slot being filled from the
 * end is never one that still has to be removed.
 *
 * An id that is not in `treeIds` changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  const targets: number[] = [];
  for (let i = 0; i < treeIds.length; i++) {
    if (treeIds[i] === id) targets.push(i);
  }
  if (targets.length === 0) return;

  const drawn = forest.thinInstances?.count ?? 0;
  if (drawn !== treeIds.length) {
    throw new Error(
      `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${drawn} instances`,
    );
  }

  for (let k = targets.length - 1; k >= 0; k--) {
    const index = targets[k];
    const last = treeIds.length - 1;
    removeThinInstance(forest, index);
    treeIds[index] = treeIds[last];
    treeIds.length = last;
  }
}
