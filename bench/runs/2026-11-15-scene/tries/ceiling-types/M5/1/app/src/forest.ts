import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stop drawing the tree `id` and keep `treeIds` in step with the forest's thin instances.
 *
 * `removeThinInstance` swap-removes: the last instance is moved into the freed slot and the
 * count drops by one. `treeIds` is updated the same way (not spliced), so afterwards
 * `treeIds[i]` still names the tree drawn by instance `i`. The moved tree keeps its own matrix,
 * so it stays exactly where it was; every other instance is untouched.
 *
 * An id that is not in `treeIds` is a no-op.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    if (!treeIds.includes(id)) return;

    const drawn = forest.thinInstances?.count ?? 0;
    if (drawn !== treeIds.length) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${drawn} instances`,
        );
    }

    // Walk backwards: every slot after `i` has already been checked, so the instance that
    // swap-remove moves into slot `i` is never a match we would skip (covers duplicate ids).
    for (let i = treeIds.length - 1; i >= 0; i--) {
        if (treeIds[i] !== id) continue;
        removeThinInstance(forest, i);
        const last = treeIds.length - 1;
        treeIds[i] = treeIds[last];
        treeIds.length = last;
    }
}
