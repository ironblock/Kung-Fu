import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene.
 *
 * removeFromScene also removes everything in entity.children (recursively), so
 * the children are detached from `mesh` first. Each child keeps its world place
 * because setParent(child, null) is used to unparent it. Children stay in the
 * scene's mesh list (they were added through their parent), so nothing is
 * re-added here, which also avoids a duplicate entry.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  const kids = [...mesh.children];

  for (const kid of kids) {
    setParent(kid, null);
  }

  // Make sure none remain in the removed mesh's children list, so that
  // removeFromScene does not take them with it.
  for (const kid of kids) {
    const index = mesh.children.indexOf(kid);
    if (index !== -1) {
      mesh.children.splice(index, 1);
    }
  }

  removeFromScene(scene, mesh);
}
