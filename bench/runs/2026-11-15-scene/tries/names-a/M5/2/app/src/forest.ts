import type { Mesh } from "@babylonjs/lite";
import { setThinInstances, setThinInstanceColors } from "@babylonjs/lite";

// Each thin instance is a 4x4 matrix stored as 16 consecutive floats.
const MATRIX_FLOATS = 16;

/**
 * Stops drawing every instance whose tree id is `id`.
 *
 * `treeIds[i]` is the id of the tree drawn by instance `i`. The remaining
 * instances keep their order and their transforms (and colors, if any), and
 * `treeIds` is updated in place to match the new instance indices.
 * If `id` is not present, nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  const ti = forest.thinInstances;
  if (!ti) return;

  const count = ti.count;

  let found = false;
  for (let i = 0; i < count; i++) {
    if (treeIds[i] === id) {
      found = true;
      break;
    }
  }
  if (!found) return;

  const matrices = ti.matrices;
  const colors = ti.colors ?? null;
  const colorStride = colors && count > 0 ? colors.length / count : 0;

  let kept = 0;
  for (let i = 0; i < count; i++) {
    if (treeIds[i] !== id) kept++;
  }

  const newMatrices =
    matrices instanceof Float64Array
      ? new Float64Array(kept * MATRIX_FLOATS)
      : new Float32Array(kept * MATRIX_FLOATS);
  const newColors = colors ? new Float32Array(kept * colorStride) : null;
  const newIds: string[] = [];

  let out = 0;
  for (let i = 0; i < count; i++) {
    const treeId = treeIds[i];
    if (treeId === id) continue;

    for (let k = 0; k < MATRIX_FLOATS; k++) {
      newMatrices[out * MATRIX_FLOATS + k] = matrices[i * MATRIX_FLOATS + k];
    }
    if (colors && newColors) {
      for (let k = 0; k < colorStride; k++) {
        newColors[out * colorStride + k] = colors[i * colorStride + k];
      }
    }
    newIds.push(treeId);
    out++;
  }

  setThinInstances(forest, newMatrices, kept);
  if (newColors) {
    setThinInstanceColors(forest, newColors);
  }

  // Update the id list only after the mesh has accepted the new instances.
  treeIds.length = 0;
  for (const treeId of newIds) treeIds.push(treeId);
}
