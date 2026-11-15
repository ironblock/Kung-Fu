import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping the meshes attached to it.
 *
 * Each child mesh is detached from `mesh` with `setParent(child, null)`, which
 * keeps its world transform and updates both `children` arrays. This runs before
 * `removeFromScene` so the children are no longer part of the removed subtree.
 * The kept meshes are already in `scene.meshes` (they were added through their
 * parent), so they are not added again here.
 *
 * Non-mesh children (lights, transform nodes) are left as they are.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const meshes = scene.meshes;
    // Snapshot first: setParent mutates mesh.children while we iterate.
    const keptChildren = mesh.children.filter(
        (child): child is Mesh => meshes.includes(child as Mesh),
    );

    for (const child of keptChildren) {
        setParent(child, null);
    }

    removeFromScene(scene, mesh);
}
