import { removeThinInstance, setThinInstanceColor } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

/**
 * Stops drawing the tree `id` and keeps `treeIds` in step with the instances
 * the forest mesh draws (`treeIds[i]` is the tree drawn by instance `i`).
 *
 * removeThinInstance does not shift the later instances down: it moves the
 * last instance's matrix into the freed slot. So `treeIds` is updated the same
 * way (last id into the freed slot, then drop the end) instead of with splice.
 *
 * removeThinInstance also leaves per-instance colours where they were, so the
 * tree moved into the freed slot would show the removed tree's colour. When the
 * forest has instance colours, the last instance's colour is copied across too.
 *
 * An id that is not in `treeIds` changes nothing.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    // Walk from the end, so whatever gets moved into a freed slot comes from
    // an index that was already checked (and so is not `id`).
    for (let i = treeIds.length - 1; i >= 0; i--) {
        if (treeIds[i] !== id) continue;

        const ti = forest.thinInstances;
        if (!ti || i >= ti.count) continue; // not an instance the mesh draws

        const last = ti.count - 1;

        // Read the last instance's colour before removing, if it has one.
        let lastColor: [number, number, number, number] | null = null;
        const colors = ti.colors;
        const c = last * 4;
        if (i !== last && colors && colors.length >= c + 4) {
            lastColor = [colors[c], colors[c + 1], colors[c + 2], colors[c + 3]];
        }

        removeThinInstance(forest, i);

        if (i !== last) {
            treeIds[i] = treeIds[last];
            if (lastColor) {
                const [r, g, b, a] = lastColor;
                setThinInstanceColor(forest, i, r, g, b, a);
            }
        }
        treeIds.length = last;
    }
}
