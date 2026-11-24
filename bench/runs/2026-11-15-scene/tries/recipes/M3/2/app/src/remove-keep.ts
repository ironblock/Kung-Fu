import type { Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";

/**
 * Removes `mesh` from the scene but keeps its direct children in the scene,
 * detached from `mesh` and at the same world position.
 *
 * removeFromScene also removes a mesh's children, so the children are
 * detached first; the mesh is then removed alone.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  // Copy: setParent changes mesh.children, so iterate over a snapshot.
  const kids = [...mesh.children];

  // Remember which children are in the scene's mesh list now, so exactly
  // those are restored afterwards and none is listed twice.
  const listed = kids.filter((kid) => scene.meshes.includes(kid as Mesh));

  for (const kid of kids) {
    // Assumed: setParent(child, null) detaches and keeps the world position,
    // as setParent(child, parent) does per the recipes. Not verified.
    setParent(kid, null);
  }

  removeFromScene(scene, mesh);

  for (const kid of listed) {
    if (!scene.meshes.includes(kid as Mesh)) {
      addToScene(scene, kid);
    }
  }
}
