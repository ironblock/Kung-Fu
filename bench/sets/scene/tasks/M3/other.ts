import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Another right answer: empty the children list first, then put each child in world space.
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const kept = mesh.children.splice(0, mesh.children.length);
    for (const child of kept) {
        setParent(child, null);
    }
    removeFromScene(scene, mesh);
}
