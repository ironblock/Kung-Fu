import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

// Removes `mesh` from the scene while keeping its direct children in the scene,
// at their current world positions, detached from `mesh`.
//
// Order matters: removeFromScene also removes everything in mesh.children
// (recursively), so each child is detached first. setParent(child, null) keeps
// the child's world transform and drops it from mesh.children. The children were
// never removed from the scene, so they stay in scene.meshes exactly once and
// must not be re-added.
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  const children = [...mesh.children];
  for (const child of children) {
    setParent(child, null);
  }
  removeFromScene(scene, mesh);
}
