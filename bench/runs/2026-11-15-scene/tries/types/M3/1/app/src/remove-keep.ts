import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping the things attached to it.
 *
 * Every direct child of `mesh` is first detached with `setParent(child, null)`.
 * That keeps each child's world transform, so it stays exactly where it was.
 * Only after that is `mesh` removed from the scene. The children are never
 * removed or re-added, so each one stays in `scene.meshes` exactly once.
 * Grandchildren remain under their own parents.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  // Copy first: setParent edits `mesh.children` while we iterate.
  const children = [...mesh.children];
  for (const child of children) {
    setParent(child, null);
  }
  removeFromScene(scene, mesh);
}
