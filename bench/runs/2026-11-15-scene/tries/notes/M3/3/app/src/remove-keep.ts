import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene.
 *
 * removeFromScene also removes everything in `mesh.children` recursively, so the
 * children are first detached with setParent(child, null), which keeps each child's
 * world transform. After that the mesh has no children and removeFromScene only
 * takes the mesh itself. The kept children were never removed from scene.meshes, so
 * they are not re-added (which would duplicate them).
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  // Copy first: setParent mutates mesh.children while we iterate.
  const children = [...mesh.children];
  for (const child of children) {
    setParent(child, null);
  }

  // Check before removing: if a child is still attached, removeFromScene would
  // take it out of the scene too.
  if (mesh.children.length !== 0) {
    throw new Error(
      `removeKeepingAttached: ${mesh.children.length} child(ren) still attached to mesh; aborting before removal`,
    );
  }

  removeFromScene(scene, mesh);
}
