import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance, setThinInstanceColor } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id.
 *
 * `removeThinInstance` swap-removes: the last instance moves into the removed
 * slot. `treeIds` is updated the same way so that `treeIds[i]` keeps naming the
 * tree drawn by instance `i`. Thin-instance colors are not moved by the library,
 * so the last instance's color is copied into the freed slot as well.
 *
 * If `id` is not in `treeIds`, nothing changes.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    let index = treeIds.indexOf(id);
    if (index === -1) {
        return;
    }

    const thin = forest.thinInstances;
    if (!thin) {
        throw new Error(`removeTree: "${id}" is listed in treeIds but forest has no thin instances`);
    }
    if (treeIds.length !== thin.count) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but forest draws ${thin.count} instances`,
        );
    }

    // Normally an id appears once; loop so that every entry for it is removed.
    while (index !== -1) {
        const last = treeIds.length - 1;

        let lastColor: [number, number, number, number] | null = null;
        const colors = forest.thinInstances?.colors;
        if (colors && index !== last) {
            const o = last * 4;
            lastColor = [colors[o], colors[o + 1], colors[o + 2], colors[o + 3]];
        }

        removeThinInstance(forest, index);

        treeIds[index] = treeIds[last];
        treeIds.length = last;

        if (lastColor) {
            setThinInstanceColor(forest, index, lastColor[0], lastColor[1], lastColor[2], lastColor[3]);
        }

        index = treeIds.indexOf(id);
    }
}
