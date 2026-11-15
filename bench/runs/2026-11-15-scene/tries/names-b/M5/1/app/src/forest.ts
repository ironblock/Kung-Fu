import type { Mesh } from "@babylonjs/lite";
import { setThinInstances, setThinInstanceColors } from "@babylonjs/lite";

/**
 * Stops drawing the tree with the given id.
 *
 * The forest is one mesh drawn with thin instances, and `treeIds[i]` names the
 * tree drawn by instance `i`. Removing a tree drops its instance(s) and shifts
 * the later instances down by one slot, keeping their order and transforms.
 * `treeIds` is compacted in place to match. If `id` is not in `treeIds`,
 * nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const ti = forest.thinInstances;
    if (!ti) {
        return;
    }

    const count = ti.count;
    if (treeIds.length !== count) {
        throw new Error(
            `removeTree: treeIds has ${treeIds.length} entries but the forest draws ${count} instances`,
        );
    }

    // Instances to keep, in their original order.
    const kept: number[] = [];
    for (let i = 0; i < count; i++) {
        if (treeIds[i] !== id) {
            kept.push(i);
        }
    }
    if (kept.length === count) {
        return; // id not present
    }

    const newCount = kept.length;

    // Matrices: 16 floats per instance.
    const matrices = ti.matrices;
    const newMatrices: Float32Array | Float64Array =
        matrices instanceof Float64Array
            ? new Float64Array(newCount * 16)
            : new Float32Array(newCount * 16);
    for (let k = 0; k < newCount; k++) {
        const src = kept[k] * 16;
        newMatrices.set(matrices.subarray(src, src + 16), k * 16);
    }

    // Colors (optional): 4 floats per instance.
    const colors = ti.colors;
    let newColors: Float32Array | null = null;
    if (colors) {
        newColors = new Float32Array(newCount * 4);
        for (let k = 0; k < newCount; k++) {
            const src = kept[k] * 4;
            newColors.set(colors.subarray(src, src + 4), k * 4);
        }
    }

    setThinInstances(forest, newMatrices, newCount);
    if (newColors) {
        setThinInstanceColors(forest, newColors);
    }

    // Compact treeIds in place. `kept` is increasing and w <= kept[w], so no
    // unread entry is overwritten.
    let w = 0;
    for (const i of kept) {
        treeIds[w++] = treeIds[i];
    }
    treeIds.length = newCount;
}
