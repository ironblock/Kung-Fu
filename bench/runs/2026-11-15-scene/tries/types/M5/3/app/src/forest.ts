import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stop drawing the tree with the given id.
 *
 * `forest` draws one thin instance per tree. `treeIds[i]` is the id of the tree
 * drawn by instance `i`. `removeThinInstance` swap-removes: the last instance
 * moves into the freed slot and the count shrinks by one. `treeIds` is updated
 * with the same swap, so afterwards it still names the tree of every instance.
 * Other trees keep their world placement; only their instance index can change.
 *
 * If `id` is not in `treeIds`, nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const ti = forest.thinInstances;
    const count = ti ? ti.count : 0;

    // Find the matching instances first, so an unknown id changes nothing.
    const matches: number[] = [];
    for (let i = 0; i < count; i++) {
        if (treeIds[i] === id) matches.push(i);
    }
    if (matches.length === 0) return;

    if (treeIds.length !== count) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${count} instances`,
        );
    }

    // Remove from the highest index down. A swap-remove at index i pulls in the
    // instance at the current last index, which has already been checked (it is
    // above i) and is not a match, so no match is skipped or moved unseen.
    for (let k = matches.length - 1; k >= 0; k--) {
        const i = matches[k];
        const last = treeIds.length - 1;
        removeThinInstance(forest, i);
        treeIds[i] = treeIds[last];
        treeIds.length = last;
    }
}
