import { flushThinInstances, removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id.
 *
 * `treeIds[i]` is the id of the tree drawn by thin instance `i`. Removing an
 * instance moves the last instance into its slot, so `treeIds` gets the same
 * swap-remove applied to it, keeping the two in step. Other trees keep their
 * world positions. An id that is not in `treeIds` changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const ti = forest.thinInstances;
    if (!ti) {
        throw new Error("removeTree: forest has no thin instances");
    }
    if (ti.count !== treeIds.length) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but forest draws ${ti.count} instances`,
        );
    }

    let removed = false;
    // Walk from the end. Each swap-remove pulls the current last entry into
    // slot i; every slot above i has already been checked and is not `id`,
    // so the pulled-in entry is never a match that we would miss.
    for (let i = treeIds.length - 1; i >= 0; i--) {
        if (treeIds[i] !== id) {
            continue;
        }
        const last = treeIds.length - 1;
        removeThinInstance(forest, i);
        treeIds[i] = treeIds[last];
        treeIds.pop();
        removed = true;
    }

    if (removed) {
        flushThinInstances(forest);
    }
}
