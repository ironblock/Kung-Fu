import type { Mesh } from "@babylonjs/lite";
import { setThinInstanceColors, setThinInstances } from "@babylonjs/lite";

const MATRIX_FLOATS = 16;
const COLOR_FLOATS = 4;

/**
 * Stops drawing the tree with the given id.
 *
 * `forest` is a mesh drawn with thin instances, one per tree. `treeIds[i]` is the id
 * of the tree drawn by instance `i`. Every instance whose id matches is removed; the
 * remaining instances keep their matrices (and colors, if any) in their original order,
 * and `treeIds` is updated in place to match the new instance indices. If the id is not
 * present, nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const ti = forest.thinInstances;
    if (!ti) {
        return;
    }

    const count = ti.count;

    // Indices of the instances that stay.
    const keep: number[] = [];
    let found = false;
    for (let i = 0; i < count; i++) {
        if (treeIds[i] === id) {
            found = true;
        } else {
            keep.push(i);
        }
    }
    if (!found) {
        return;
    }

    // Copy the surviving matrices, preserving the source array's precision.
    const src = ti.matrices;
    const matrices =
        src instanceof Float64Array
            ? new Float64Array(keep.length * MATRIX_FLOATS)
            : new Float32Array(keep.length * MATRIX_FLOATS);
    for (let k = 0; k < keep.length; k++) {
        const s = keep[k] * MATRIX_FLOATS;
        matrices.set(src.subarray(s, s + MATRIX_FLOATS), k * MATRIX_FLOATS);
    }

    // Copy the surviving colors, if this mesh has per-instance colors.
    let colors: Float32Array | null = null;
    if (ti.colors) {
        colors = new Float32Array(keep.length * COLOR_FLOATS);
        for (let k = 0; k < keep.length; k++) {
            const s = keep[k] * COLOR_FLOATS;
            colors.set(ti.colors.subarray(s, s + COLOR_FLOATS), k * COLOR_FLOATS);
        }
    }

    setThinInstances(forest, matrices, keep.length);
    if (colors) {
        setThinInstanceColors(forest, colors);
    }

    // Keep the id list in step with the new instance order.
    const newIds = keep.map((i) => treeIds[i]);
    treeIds.length = 0;
    for (const tid of newIds) {
        treeIds.push(tid);
    }
}
