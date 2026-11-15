import { removeThinInstance } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

// Remove the instance, and drop its id so the later ids shift down with the later instances.
export function removeTree(forest: Mesh, treeIds: string[], id: string): void {
    const index = treeIds.indexOf(id);
    if (index < 0) {
        return;
    }
    removeThinInstance(forest, index);
    treeIds.splice(index, 1);
}
