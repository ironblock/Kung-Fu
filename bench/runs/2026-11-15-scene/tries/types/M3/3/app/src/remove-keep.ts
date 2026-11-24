import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

type Child = Mesh["children"][number];

/**
 * Remove `mesh` from the scene while keeping the nodes attached to it.
 *
 * Every direct child is detached first with `setParent(child, null)`, which keeps its
 * world transform, so it stays exactly where it was. Detaching before removal means the
 * removal cannot reach the children, whether or not it recurses through `children`.
 * Children that were in `scene.meshes` remain there, each appearing once.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const children: Child[] = mesh.children.slice();

    // Children that are currently in the scene's mesh list. Only these are kept in it.
    const keptMeshes = children.filter((child) => scene.meshes.includes(child as Mesh));

    // Detach every child while keeping its world transform. This also removes each child
    // from `mesh.children`, so the removal below does not reach them.
    for (const child of children) {
        setParent(child, null);
    }

    removeFromScene(scene, mesh);

    for (const child of keptMeshes) {
        const m = child as Mesh;
        if (!scene.meshes.includes(m)) {
            // Only reached if removal dropped the child from the list anyway.
            addToScene(scene, m);
        }

        // Keep exactly one entry per kept mesh.
        let seen = false;
        for (let i = scene.meshes.length - 1; i >= 0; i--) {
            if (scene.meshes[i] === m) {
                if (seen) scene.meshes.splice(i, 1);
                seen = true;
            }
        }
    }
}
