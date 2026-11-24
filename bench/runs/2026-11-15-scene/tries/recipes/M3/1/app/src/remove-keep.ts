import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene.
 *
 * Each child is detached from `mesh` before the removal, so `removeFromScene`
 * only takes `mesh` out and does not reach the children. Children are not
 * re-added: they were added through their parent and are already in
 * `scene.meshes` once each.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Copy first: setParent changes mesh.children while we iterate.
    const children = [...mesh.children];
    for (const child of children) {
        setParent(child as Mesh, null);
    }
    removeFromScene(scene, mesh);
}
