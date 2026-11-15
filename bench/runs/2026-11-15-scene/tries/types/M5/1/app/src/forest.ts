import type { Mesh } from "@babylonjs/lite";
import { flushThinInstances, removeThinInstance } from "@babylonjs/lite";

/**
 * Stop drawing the tree with the given id.
 *
 * `forest` is one tree mesh drawn with thin instances; `treeIds[i]` is the id of
 * the tree drawn by instance `i`. Removal uses the library's swap-remove: the last
 * instance moves into the freed slot, so every other tree keeps its matrix. The
 * same swap is applied to `treeIds` so it still names the tree of every instance.
 * An id that is not present changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const count = forest.thinInstances ? forest.thinInstances.count : 0;
    if (treeIds.length !== count) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${count} instances`,
        );
    }

    // Walk downwards so that a swap-remove only moves an entry from the end that
    // has already been checked (and is not `id`) into the slot being freed.
    let removed = false;
    for (let i = count - 1; i >= 0; i--) {
        if (treeIds[i] !== id) continue;
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
