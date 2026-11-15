import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene but keeps its direct children in the scene.
 *
 * - Each child is detached from `mesh` (it keeps its place in the world).
 * - `mesh` leaves the scene and is detached from its own parent.
 * - Every other mesh that was in `scene.meshes` stays there exactly once.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Meshes that must still be in the scene afterwards (everything except `mesh`).
    const survivors = scene.meshes.filter((m) => m !== mesh);

    // Detach the children first, so removing `mesh` cannot take them along.
    // setParent(child, null) is expected to keep the child's world transform.
    const children = mesh.children.slice();
    for (const child of children) {
        setParent(child, null);
    }

    if (mesh.parent) {
        setParent(mesh, null);
    }

    removeFromScene(scene, mesh);

    // Make sure every survivor is in the mesh list, adding only the missing ones.
    for (const m of survivors) {
        if (!scene.meshes.includes(m)) {
            addToScene(scene, m);
        }
    }

    // Drop any duplicate entries (and `mesh` itself) in place, keeping the first occurrence.
    const list = scene.meshes;
    const seen = new Set<Mesh>();
    for (let i = 0; i < list.length; ) {
        const entry = list[i];
        if (entry === mesh || seen.has(entry)) {
            list.splice(i, 1);
        } else {
            seen.add(entry);
            i++;
        }
    }
}
