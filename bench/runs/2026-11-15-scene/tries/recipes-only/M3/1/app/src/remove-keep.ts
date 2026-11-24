import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Removes `mesh` from the scene, but keeps its direct children in the scene at
// their current world positions, no longer attached to `mesh`.
//
// The children must be detached before the removal: removeFromScene on a parent
// also removes its children (see scene-recipes.md, recipe 3). Each child is
// already in scene.meshes from when it was added through its parent, so it is
// not added again; the guard below only covers a child that is missing.
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  // Copy first: setParent changes mesh.children while we iterate.
  const children = [...mesh.children];

  for (const child of children) {
    // Detach without changing the child's world transform (assumed; see notes).
    setParent(child, null);
    if (!scene.meshes.includes(child)) {
      addToScene(scene, child);
    }
  }

  removeFromScene(scene, mesh);
}
