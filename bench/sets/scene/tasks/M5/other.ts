import { setThinInstances } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

// Another right answer: rebuild the instance matrices without the tree, order kept.
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const index = treeIds.indexOf(id);
    const ti = forest.thinInstances;
    if (index < 0 || !ti) {
        return;
    }
    const kept = new Float32Array((ti.count - 1) * 16);
    let at = 0;
    for (let i = 0; i < ti.count; i++) {
        if (i !== index) {
            kept.set(ti.matrices.subarray(i * 16, i * 16 + 16), at * 16);
            at++;
        }
    }
    setThinInstances(forest, kept, ti.count - 1);
    treeIds.splice(index, 1);
}
