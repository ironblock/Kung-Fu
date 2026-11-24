import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene.
 *
 * Removing a node from the scene also removes everything under it, so each
 * child is first detached from `mesh` (setParent with no parent). Children
 * are already in scene.meshes (they were added through their parent), so they
 * are not added again, which would duplicate them.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  // Copy first: detaching changes mesh.children while we iterate.
  const children = [...mesh.children];
  for (const child of children) {
    setParent(child, null);
  }

  // Safety net: removeFromScene would take any child still attached with it.
  if (mesh.children.length !== 0) {
    throw new Error("removeKeepingAttached: children still attached to mesh");
  }

  removeFromScene(scene, mesh);
}
