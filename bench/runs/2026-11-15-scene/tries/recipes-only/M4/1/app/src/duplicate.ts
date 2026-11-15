import { addToScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Makes a copy of `book` on the same shelf (the book's parent), `dx` units
// further along the shelf's local x axis.
//
// A book's position is expressed in its shelf's local space, so the copy's
// local position is the book's local position plus dx on x. Because the copy
// is parented to the same shelf, it moves and turns with the shelf.
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const shelf = book.parent;
  if (!shelf) {
    throw new Error("duplicateAlongShelf: book is not attached to a shelf");
  }

  // Record the book's local transform before parenting, because setParent
  // may rewrite the copy's local values to keep its world position.
  const pos = { x: book.position.x, y: book.position.y, z: book.position.z };
  const scl = { x: book.scaling.x, y: book.scaling.y, z: book.scaling.z };
  const rot = { x: book.rotation.x, y: book.rotation.y, z: book.rotation.z };
  const quat = book.rotationQuaternion ? book.rotationQuaternion.clone() : null;

  const copy = book.clone(`${book.name}-copy`); // ASSUMED: Mesh.clone exists in Lite
  copy.material = book.material;
  copy.receiveShadows = book.receiveShadows;

  setParent(copy, shelf);

  // Restore the local transform explicitly, then shift along the shelf's x.
  copy.position.x = pos.x + dx;
  copy.position.y = pos.y;
  copy.position.z = pos.z;
  copy.scaling.x = scl.x;
  copy.scaling.y = scl.y;
  copy.scaling.z = scl.z;
  copy.rotation.x = rot.x;
  copy.rotation.y = rot.y;
  copy.rotation.z = rot.z;
  if (quat) {
    copy.rotationQuaternion = quat.clone(); // ASSUMED: Quaternion.clone exists
  }

  addToScene(scene, copy);
  return copy;
}
