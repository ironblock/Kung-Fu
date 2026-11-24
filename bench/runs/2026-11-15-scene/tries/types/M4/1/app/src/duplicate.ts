import type { Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";

/**
 * Duplicate a book mesh on its shelf.
 *
 * The copy is parented to the same shelf as `book`, so it moves and turns with
 * the shelf. Its local transform is the book's local transform with `dx` added
 * to the local x position. Because both meshes share the shelf as parent, that
 * local offset is `dx` along the shelf's own x axis, in shelf units.
 *
 * The original mesh is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const node = cloneTransformNode(book);
  if (!("material" in node)) {
    throw new Error("duplicateAlongShelf: cloneTransformNode did not return a mesh");
  }
  const copy = node as Mesh;
  copy.name = `${book.name}_copy`;

  // setParent keeps the copy's world transform, which rewrites its local
  // transform. The local TRS is therefore written explicitly below.
  setParent(copy, book.parent);

  copy.position.x = book.position.x + dx;
  copy.position.y = book.position.y;
  copy.position.z = book.position.z;

  copy.rotationQuaternion.x = book.rotationQuaternion.x;
  copy.rotationQuaternion.y = book.rotationQuaternion.y;
  copy.rotationQuaternion.z = book.rotationQuaternion.z;
  copy.rotationQuaternion.w = book.rotationQuaternion.w;

  copy.scaling.x = book.scaling.x;
  copy.scaling.y = book.scaling.y;
  copy.scaling.z = book.scaling.z;

  addToScene(scene, copy);
  return copy;
}
