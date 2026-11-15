import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Removes `mesh` from `scene` but keeps everything directly attached to it.
 *
 * Each direct child of `mesh` keeps its world transform and is re-attached to
 * whatever `mesh` itself was attached to (or to nothing, if `mesh` had no
 * parent). Its own children come along with it. The kept nodes are neither
 * removed from nor re-added to the scene, so each one stays in `scene.meshes`
 * exactly once, as before.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Read the parent first: removeFromScene sets mesh.parent to null.
    const holder = mesh.parent;

    // Detach the children before removing the mesh. removeFromScene also
    // removes everything still listed in mesh.children, recursively, and
    // queues it for disposal, after which it can never be added back.
    for (const child of [...mesh.children]) {
        // setParent keeps the world transform and adds the child to
        // holder.children. A plain `child.parent = holder` would keep the local
        // transform instead, so the child would move.
        setParent(child, holder);
        // Nothing says setParent takes the child out of the old parent's
        // children list, so do it here.
        removeFrom(mesh.children, child);
    }

    removeFromScene(scene, mesh);

    // removeFromScene leaves the mesh in its parent's children list. Left
    // there, a later addToScene or cloneTransformNode on that parent would
    // reach the disposed mesh and throw.
    if (holder !== null && hasChildren(holder)) {
        removeFrom(holder.children, mesh);
    }
}

function removeFrom<T>(list: T[], item: T): void {
    const index = list.indexOf(item);
    if (index !== -1) list.splice(index, 1);
}

function hasChildren(node: object): node is { children: unknown[] } {
    return Array.isArray((node as { children?: unknown }).children);
}
