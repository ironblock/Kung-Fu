import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

type Child = Mesh["children"][number];

function dropFrom(list: Mesh["children"] | undefined, node: Child | Mesh): void {
    if (!Array.isArray(list)) return;
    const i = list.indexOf(node);
    if (i !== -1) list.splice(i, 1);
}

/**
 * Removes `mesh` from the scene but keeps its direct children in the scene,
 * at the same world transform, no longer attached to `mesh`.
 *
 * removeFromScene also takes away everything in `mesh.children`, so the
 * children are moved out first. They are not added to the scene again: they
 * are already in scene.meshes (they came in through their parent), and adding
 * them a second time could list them twice.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Kept children go to the removed mesh's own parent, so they stay in the
    // same group (e.g. the room). If the mesh is at the root, that is null.
    const newParent = mesh.parent;

    for (const child of [...mesh.children]) {
        // setParent keeps the world transform and updates the child's parent link.
        setParent(child, newParent);
        // The library docs only say setParent adds to the NEW parent's children,
        // so also make sure the child is out of the removed mesh's list.
        dropFrom(mesh.children, child);
    }

    // Take the removed mesh out of its own parent's children too, so the parent
    // does not keep a retired mesh (which would break cloning it later, for example).
    if (newParent !== null) {
        setParent(mesh, null);
        dropFrom((newParent as { children?: Mesh["children"] }).children, mesh);
    }

    removeFromScene(scene, mesh);
}
