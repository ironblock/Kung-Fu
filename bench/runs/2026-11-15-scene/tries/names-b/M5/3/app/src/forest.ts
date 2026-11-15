import type { Mesh } from "@babylonjs/lite";
import { setThinInstanceCount, setThinInstanceMatrix } from "@babylonjs/lite";

// Matrix argument type of setThinInstanceMatrix, taken from the library's own signature.
type ThinMatrix = Parameters<typeof setThinInstanceMatrix>[2];

// Each thin instance is one 4x4 matrix, stored as 16 consecutive floats.
const MATRIX_FLOATS = 16;

/**
 * Stops drawing the tree with the given id.
 *
 * `treeIds[i]` names the tree drawn by thin instance `i`. Removal is a swap-remove:
 * the last instance's matrix is moved into the freed slot and its id is moved with it,
 * so every remaining tree keeps its world transform and `treeIds` stays in step with
 * the instances. An id that is not in `treeIds` changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  let index = treeIds.indexOf(id);
  while (index !== -1) {
    removeInstance(forest, treeIds, index);
    index = treeIds.indexOf(id);
  }
}

function removeInstance(forest: Mesh, treeIds: string[], index: number): void {
  const ti = forest.thinInstances;
  if (!ti) {
    throw new Error("removeTree: forest mesh has no thin instances");
  }
  const count = ti.count;
  if (treeIds.length !== count) {
    throw new Error(
      `removeTree: treeIds has ${treeIds.length} entries but the mesh draws ${count} instances`,
    );
  }

  const last = count - 1;
  if (index !== last) {
    // Move the last instance's matrix into the freed slot.
    const m: number[] = [];
    for (let k = 0; k < MATRIX_FLOATS; k++) {
      m.push(ti.matrices[last * MATRIX_FLOATS + k]);
    }
    setThinInstanceMatrix(forest, index, m as unknown as ThinMatrix);
  }

  // Keep the id list in step with the instances.
  treeIds[index] = treeIds[last];
  treeIds.length = last;

  // Drop the now-unused last instance.
  setThinInstanceCount(forest, last);
}
