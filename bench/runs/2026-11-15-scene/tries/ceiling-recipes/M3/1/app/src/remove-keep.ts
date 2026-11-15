import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Removes `mesh` from `scene` but keeps everything directly attached to it.
 *
 * Each direct child of `mesh` stays in the scene at the same world transform.
 * It is re-attached to `mesh`'s own parent, or left with no parent if `mesh`
 * was top-level. Grandchildren stay attached to their kept parent.
 *
 * - removeFromScene removes and disposes a node together with everything in its
 *   `children` list, so the children are detached first. setParent keeps their
 *   world transform and takes them out of `mesh.children`. A plain
 *   `child.parent = ...` would do neither.
 * - The children are not added to the scene again. They were added through
 *   their parent and are already in `scene.meshes`, so calling addToScene on
 *   them would list and draw them twice.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const newParent = mesh.parent ?? null;

    // setParent edits mesh.children, so loop over a copy.
    const kept = [...mesh.children];
    for (const child of kept) {
        setParent(child, newParent);
    }

    // Safety net: if a kept child is still in mesh.children, removeFromScene
    // would remove and dispose it along with the mesh.
    for (const child of kept) {
        const i = mesh.children.indexOf(child);
        if (i !== -1) mesh.children.splice(i, 1);
    }

    removeFromScene(scene, mesh);
}
