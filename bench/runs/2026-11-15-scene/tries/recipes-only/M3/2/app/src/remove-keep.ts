import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

// Removes `mesh` from the scene while keeping its direct children in the scene.
// Each child is detached first (setParent with null), so removeFromScene does not
// take it along, and it is not re-added, so it stays in scene.meshes exactly once.
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  const children = [...mesh.children];
  for (const child of children) {
    setParent(child, null);
  }
  removeFromScene(scene, mesh);
}
