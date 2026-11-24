import type { Mesh } from "@babylonjs/lite";
import { removeThinInstance, setThinInstanceColor, setThinInstanceMatrix } from "@babylonjs/lite";

// The library's Mat4 type isn't in the declarations we have, so take it from the function that uses it.
type Mat4 = Parameters<typeof setThinInstanceMatrix>[2];

const MATRIX_FLOATS = 16;
const COLOR_FLOATS = 4; // setThinInstanceColor takes r, g, b, a

/**
 * Stops drawing the tree `id`, and updates `treeIds` in place so that `treeIds[i]` is still the
 * tree drawn by thin instance `i`. An id that isn't in `treeIds` changes nothing.
 *
 * The last instance is moved into the removed tree's slot, then the last slot is removed.
 * Removing the *last* instance means the same thing however `removeThinInstance` reorders the
 * instances it keeps (its declaration doesn't say), so `treeIds` can be updated to match exactly.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const index = treeIds.indexOf(id);
    if (index < 0) return;

    const thin = forest.thinInstances;
    const count = thin?.count ?? 0;
    if (!thin || count !== treeIds.length) {
        throw new Error(`removeTree: forest draws ${count} instances but treeIds has ${treeIds.length}`);
    }

    const last = count - 1;
    if (index !== last) {
        // slice() keeps the storage's element type (Float32 or Float64), so the moved tree's
        // transform is copied exactly and it stays exactly where it was.
        const m = last * MATRIX_FLOATS;
        setThinInstanceMatrix(forest, index, thin.matrices.slice(m, m + MATRIX_FLOATS) as unknown as Mat4);

        const colors = thin.colors;
        if (colors) {
            const c = last * COLOR_FLOATS;
            setThinInstanceColor(forest, index, colors[c], colors[c + 1], colors[c + 2], colors[c + 3]);
        }
    }
    removeThinInstance(forest, last);

    treeIds[index] = treeIds[last];
    treeIds.pop();

    if ((forest.thinInstances?.count ?? 0) !== treeIds.length) {
        throw new Error("removeTree: removeThinInstance did not drop the last instance");
    }
}
