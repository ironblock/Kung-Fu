import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Remove `mesh` from the scene but keep everything directly attached to it.
 *
 * Each child is detached before the removal and moved up to `mesh`'s own parent
 * (or to world space when `mesh` has none), keeping its world transform. It stays
 * in `scene.meshes` exactly once, as it was, because it is never removed or re-added.
 *
 * The detach has to come first. `removeFromScene` undoes what `addToScene` did, and
 * meshes added through their parent were added as a whole hierarchy. Any child still
 * attached would leave with the mesh and, on leaving its last scene, be disposed
 * permanently: `addToScene` throws for a disposed mesh, so it could not be put back.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const newParent = mesh.parent ?? null;

    // Copy the list first: setParent takes each child out of `mesh.children`.
    for (const child of [...mesh.children]) {
        // Keeps the child's world transform and moves it from `mesh.children`
        // into the new parent's `children`.
        setParent(child, newParent);

        // setParent finds the old parent through `child.parent`. If a child was
        // listed here without that link, it would still be in the list, and
        // removeFromScene would take it out along with the mesh.
        const index = mesh.children.indexOf(child);
        if (index !== -1) mesh.children.splice(index, 1);
    }

    // Unhook the removed mesh from its parent too, so the parent's `children`
    // does not keep a disposed mesh (cloneTransformNode / addToScene reject one).
    if (mesh.parent) setParent(mesh, null);

    removeFromScene(scene, mesh);
}
