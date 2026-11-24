import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stops drawing the tree `id` and keeps `treeIds` in step with the instances,
 * so that afterwards `treeIds[i]` is still the tree drawn by instance `i`.
 *
 * removeThinInstance(mesh, i) does not shift the later instances down: it
 * moves the LAST instance into slot i. That tree's matrix moves with it, so it
 * stays where it is in the world; only its index changes. `treeIds` is
 * updated the same way (last id into slot i, then drop the tail). Using
 * splice here would shift every later id by one and mislabel them.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    let i = treeIds.indexOf(id);
    if (i === -1) return;

    // The swap below only mirrors the mesh if the two are in step to begin with.
    const count = forest.thinInstances?.count ?? 0;
    if (count !== treeIds.length) {
        throw new Error(
            `removeTree: forest draws ${count} instances but treeIds has ${treeIds.length} entries`,
        );
    }

    // Normally one instance per id; if the id appears more than once, remove
    // every copy so the tree really stops being drawn.
    while (i !== -1) {
        removeThinInstance(forest, i);
        const last = treeIds.length - 1;
        treeIds[i] = treeIds[last];
        treeIds.pop();
        // Slot i now holds the former last id, which is checked too.
        i = treeIds.indexOf(id, i);
    }
}
