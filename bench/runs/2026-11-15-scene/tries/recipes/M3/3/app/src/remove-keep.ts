import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene, but keeps its direct children in the scene.
 *
 * Each child is detached from `mesh` first (so `removeFromScene`, which takes
 * the whole subtree with it, does not remove them), then the mesh is removed.
 * The children were already added to the scene through their parent, so they
 * stay in `scene.meshes` exactly once and are not added again.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Copy first: setParent changes mesh.children while we iterate.
    const children = [...mesh.children];
    for (const child of children) {
        setParent(child, null);
    }
    removeFromScene(scene, mesh);
}
