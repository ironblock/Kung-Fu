import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stops drawing every instance of the tree `id` in `forest` and keeps
 * `treeIds` in step with the instances that remain: `treeIds[i]` is the id of
 * the tree drawn by instance `i`. If `id` is not in `treeIds`, nothing changes.
 *
 * removeThinInstance moves the last instance into the freed slot, so the
 * matching entry in `treeIds` is replaced by the last entry and popped.
 * Each other tree keeps its matrix; only its instance index may change.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    if (!treeIds.includes(id)) {
        return;
    }

    const count = forest.thinInstances ? forest.thinInstances.count : 0;
    if (treeIds.length !== count) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${count} instances`,
        );
    }

    let i = 0;
    while (i < treeIds.length) {
        if (treeIds[i] === id) {
            const last = treeIds.length - 1;
            removeThinInstance(forest, i);
            treeIds[i] = treeIds[last];
            treeIds.pop();
            // Slot i now holds the instance moved from the end; check it too.
        } else {
            i++;
        }
    }
}
