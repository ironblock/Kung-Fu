import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// removeFromScene takes the whole subtree under `mesh` out with it (and detaches each removed
// child), so first move the children to world space, which also drops them from `mesh.children`.
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    for (const child of [...mesh.children]) {
        setParent(child, null);
    }
    removeFromScene(scene, mesh);
}
