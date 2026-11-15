import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

// removeThinInstance swap-removes: the LAST instance is copied into the freed slot. Mirror that.
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const index = treeIds.indexOf(id);
    if (index < 0) {
        return;
    }
    removeThinInstance(forest, index);
    const last = treeIds.pop()!;
    if (index < treeIds.length) {
        treeIds[index] = last;
    }
}
