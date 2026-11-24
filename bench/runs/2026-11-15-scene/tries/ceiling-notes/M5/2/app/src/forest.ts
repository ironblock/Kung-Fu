import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance, setThinInstanceColor } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id and updates `treeIds` in place so
 * that `treeIds[i]` still names the tree drawn by thin instance `i`.
 * An id that is not in `treeIds` changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const index = treeIds.indexOf(id);
    if (index < 0) return;

    const instances = forest.thinInstances;
    // If this happens, treeIds does not match the mesh, so there is nothing safe to remove.
    if (!instances || index >= instances.count) return;

    const last = instances.count - 1;

    // removeThinInstance swap-removes: the last instance's matrix is copied
    // into slot `index`. Its color is not moved, so slot `index` would keep the
    // removed tree's color. Save the last instance's color now and write it
    // into its new slot afterwards.
    const lastColor =
        index !== last && instances.colors
            ? instances.colors.slice(last * 4, last * 4 + 4)
            : null;

    removeThinInstance(forest, index);

    if (lastColor) {
        setThinInstanceColor(forest, index, lastColor[0], lastColor[1], lastColor[2], lastColor[3]);
    }

    // Make the same swap in treeIds: the tree that was last now sits at `index`.
    treeIds[index] = treeIds[last];
    treeIds.length = last;
}
