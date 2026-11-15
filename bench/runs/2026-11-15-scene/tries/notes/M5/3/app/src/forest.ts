import { removeThinInstance, setThinInstanceColor } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id.
 *
 * `removeThinInstance` is a swap-remove: the last instance's matrix is moved
 * into the removed slot and the last index goes away. Per-instance colors are
 * not moved by the library, so this function moves the last color into the
 * removed slot itself. `treeIds` gets the same swap-remove so that
 * `treeIds[i]` keeps naming the tree drawn by instance `i`.
 *
 * If `id` is not in `treeIds`, nothing changes.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  let index = treeIds.indexOf(id);
  if (index === -1) return;

  const ti = forest.thinInstances;
  if (!ti || ti.count !== treeIds.length) {
    throw new Error(
      `removeTree: forest has ${ti ? ti.count : 0} thin instances but treeIds has ${treeIds.length} entries`,
    );
  }

  // Remove every instance carrying this id (normally there is exactly one).
  while (index !== -1) {
    const last = treeIds.length - 1;
    const colors = ti.colors;

    if (colors && index !== last) {
      // Keep the moved instance's color with it, since the library won't.
      const s = last * 4;
      setThinInstanceColor(forest, index, colors[s], colors[s + 1], colors[s + 2], colors[s + 3]);
    }

    removeThinInstance(forest, index);
    treeIds[index] = treeIds[last];
    treeIds.pop();

    index = treeIds.indexOf(id);
  }
}
