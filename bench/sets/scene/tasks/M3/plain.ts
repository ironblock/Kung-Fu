import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Like Babylon.js scene.removeMesh(mesh): only the mesh itself leaves the scene; then
// detach the children while keeping their world placement.
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const children = [...mesh.children];
    removeFromScene(scene, mesh);
    for (const child of children) {
        setParent(child, null);
    }
}
