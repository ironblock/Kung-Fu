import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id.
 *
 * `treeIds[i]` is the id of the tree drawn by thin instance `i` of `forest`.
 * Removing an instance uses a swap-remove (the last instance moves into the
 * freed slot), so the same move is applied to `treeIds` to keep it in step.
 * Every other tree keeps its transform. An id not in the list changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const count = forest.thinInstances?.count ?? 0;
    if (count !== treeIds.length) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${count} instances`,
        );
    }

    // Walk from the last index down. A swap-remove at index i moves the last
    // element into i; every index above i has already been settled, so the
    // element moved down is always one we have already decided to keep.
    for (let i = treeIds.length - 1; i >= 0; i--) {
        if (treeIds[i] !== id) {
            continue;
        }
        removeThinInstance(forest, i);
        treeIds[i] = treeIds[treeIds.length - 1];
        treeIds.pop();
    }
}
