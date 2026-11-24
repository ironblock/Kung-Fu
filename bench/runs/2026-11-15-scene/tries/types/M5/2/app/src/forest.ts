import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stop drawing every instance of the tree with the given id.
 *
 * `treeIds[i]` is the id of the tree drawn by thin instance `i`. Each matching
 * instance is removed with `removeThinInstance`, which swap-removes (the last
 * instance fills the gap), so the matching `treeIds` entry is filled the same
 * way. Other instances keep their matrices. An id that is not present changes
 * nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const drawn = forest.thinInstances?.count ?? 0;
    if (treeIds.length !== drawn) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${drawn} instances`,
        );
    }

    // Walk from the highest index down. Once index i has been handled, every index
    // above it holds a non-matching id, so the element swapped in from the end is
    // never one that still needs removing.
    for (let i = treeIds.length - 1; i >= 0; i--) {
        if (treeIds[i] !== id) continue;

        const last = treeIds.length - 1;
        removeThinInstance(forest, i);
        treeIds[i] = treeIds[last];
        treeIds.pop();
    }
}
