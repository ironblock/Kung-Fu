import type { Mesh } from "@babylonjs/lite";
import { setThinInstanceColors, setThinInstances } from "@babylonjs/lite";

const MATRIX_FLOATS = 16;
const COLOR_FLOATS = 4;

/**
 * Stops drawing every instance of the tree with the given id.
 *
 * `treeIds[i]` names the tree drawn by thin instance `i`. Matching entries are
 * removed from `treeIds` in place, and the remaining instances keep their
 * original order and transforms (and colors, if the mesh has them). If `id`
 * is not in `treeIds`, nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  const ti = forest.thinInstances;
  const count = ti ? ti.count : 0;

  if (treeIds.length !== count) {
    throw new Error(
      `removeTree: treeIds has ${treeIds.length} entries but the forest mesh draws ${count} instances`,
    );
  }
  if (!ti || !treeIds.includes(id)) {
    return;
  }

  // Indices of the instances that stay, in their original order.
  const keep: number[] = [];
  for (let i = 0; i < count; i++) {
    if (treeIds[i] !== id) keep.push(i);
  }
  const n = keep.length;

  // Repack the transforms.
  const srcMatrices = ti.matrices;
  const newMatrices =
    srcMatrices instanceof Float64Array
      ? new Float64Array(n * MATRIX_FLOATS)
      : new Float32Array(n * MATRIX_FLOATS);
  for (let j = 0; j < n; j++) {
    const src = keep[j] * MATRIX_FLOATS;
    newMatrices.set(srcMatrices.subarray(src, src + MATRIX_FLOATS), j * MATRIX_FLOATS);
  }
  setThinInstances(forest, newMatrices, n);

  // Repack the per-instance colors, if any, so they stay aligned.
  const srcColors = ti.colors;
  if (srcColors) {
    const newColors = new Float32Array(n * COLOR_FLOATS);
    for (let j = 0; j < n; j++) {
      const src = keep[j] * COLOR_FLOATS;
      newColors.set(srcColors.subarray(src, src + COLOR_FLOATS), j * COLOR_FLOATS);
    }
    setThinInstanceColors(forest, newColors);
  }

  // Repack the ids the same way. keep[j] >= j, so an ascending in-place
  // copy never overwrites an entry that has not been read yet.
  for (let j = 0; j < n; j++) {
    treeIds[j] = treeIds[keep[j]];
  }
  treeIds.length = n;
}
