import { setThinInstanceCount, setThinInstanceMatrix } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

type Mat4Arg = Parameters<typeof setThinInstanceMatrix>[2];

/**
 * Stops drawing every instance of the tree with the given id.
 *
 * The surviving instances are compacted down in their original order, so
 * `treeIds[i]` keeps naming the tree drawn by instance `i`. Each surviving
 * instance keeps its own matrix, so no other tree moves. If `id` is not in
 * the list, nothing is changed.
 */
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const ti = forest.thinInstances;
    if (!ti) return;

    const count = ti.count;
    let found = false;
    for (let i = 0; i < count; i++) {
        if (treeIds[i] === id) {
            found = true;
            break;
        }
    }
    if (!found) return;

    // Walk the instances in order, copying each kept instance down into the
    // next free slot. Writes only go to slots at or before the one being read,
    // so no source matrix is overwritten before it has been read.
    let dst = 0;
    for (let src = 0; src < count; src++) {
        if (treeIds[src] === id) continue;
        if (dst !== src) {
            const matrix = ti.matrices.slice(src * 16, src * 16 + 16) as unknown as Mat4Arg;
            setThinInstanceMatrix(forest, dst, matrix);
            treeIds[dst] = treeIds[src];
        }
        dst++;
    }

    setThinInstanceCount(forest, dst);
    treeIds.length = dst;
}
