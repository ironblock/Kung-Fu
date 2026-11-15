import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene.
 *
 * removeFromScene() also removes every entry in `mesh.children` (recursively),
 * so each direct child is first detached with setParent(child, null), which
 * keeps its world transform and removes it from `mesh.children`. Only then is
 * the mesh removed. The children were never removed from scene.meshes, so each
 * stays there exactly once.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  // Copy first: setParent mutates mesh.children while we iterate.
  const children = mesh.children.slice();
  for (const child of children) {
    setParent(child, null);
  }

  if (mesh.children.length !== 0) {
    throw new Error("removeKeepingAttached: children were not detached from mesh");
  }

  removeFromScene(scene, mesh);
}
