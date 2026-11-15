import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

// Stops drawing every instance whose tree id is `id`, and keeps treeIds in
// step with the instances still drawn (treeIds[i] is the tree drawn by
// instance i). Only the removed instances disappear; the others keep their
// world positions.
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
  // removeThinInstance(forest, i) moves the LAST instance into slot i, so we
  // walk from the end. When we reach index i, every index above it has
  // already been settled: either removed, or kept because it was not `id`.
  // The instance that moves into slot i is therefore one we keep, and slot i
  // needs no second look. The same swap is applied to treeIds.
  for (let i = treeIds.length - 1; i >= 0; i--) {
    if (treeIds[i] !== id) continue;
    removeThinInstance(forest, i);
    treeIds[i] = treeIds[treeIds.length - 1];
    treeIds.pop();
  }
}
