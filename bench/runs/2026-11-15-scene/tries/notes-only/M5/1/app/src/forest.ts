import type { Mesh } from "@babylonjs/lite";
import { flushThinInstances, setThinInstanceCount } from "@babylonjs/lite";

const MATRIX_FLOATS = 16;

/**
 * Stops drawing the tree with the given id and keeps `treeIds` in step with the
 * instances the forest mesh draws.
 *
 * Remaining instances are compacted in order: each kept instance's matrix is copied
 * down into the next free slot, so every other tree keeps its exact transform and
 * its relative order. `treeIds` is compacted the same way, in place.
 *
 * If `id` is not in `treeIds`, nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  if (!treeIds.includes(id)) {
    return;
  }

  const matrices = forest.thinInstances.matrices;
  const oldCount = treeIds.length;

  let write = 0;
  for (let read = 0; read < oldCount; read++) {
    if (treeIds[read] === id) {
      continue;
    }
    if (write !== read) {
      const src = read * MATRIX_FLOATS;
      const dst = write * MATRIX_FLOATS;
      for (let k = 0; k < MATRIX_FLOATS; k++) {
        matrices[dst + k] = matrices[src + k];
      }
      treeIds[write] = treeIds[read];
    }
    write++;
  }

  treeIds.length = write;
  setThinInstanceCount(forest, write);
  flushThinInstances(forest);
}
