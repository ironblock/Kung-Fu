import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance } from "@babylonjs/lite";

/**
 * Stops drawing the tree `id` and updates `treeIds` in place so that `treeIds[i]` is
 * still the tree drawn by thin instance `i`.
 *
 * removeThinInstance(mesh, i) does not shift the later instances down. It moves the
 * last instance into slot i. So `treeIds` has to make the same swap: splicing it would
 * shift every later id onto the wrong tree. The moved tree keeps its own matrix, so it
 * stays where it was and only its index changes.
 *
 * An id that is not in `treeIds` changes nothing. If the id is listed more than once,
 * every instance drawing it is removed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    // Go from the end. Every slot above i has already been checked, so the instance
    // moved into slot i never still needs removing.
    for (let i = treeIds.length - 1; i >= 0; i--) {
        if (treeIds[i] !== id) continue;
        removeThinInstance(forest, i);
        const moved = treeIds.pop()!; // the last id, whose instance now sits in slot i
        if (i < treeIds.length) treeIds[i] = moved;
    }
}
