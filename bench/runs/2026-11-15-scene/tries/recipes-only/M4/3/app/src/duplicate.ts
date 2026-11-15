import { addToScene, cloneMesh, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Copies `book` onto the same shelf (its parent), `dx` units along the shelf's
// x axis from the original. The copy is a child of the shelf, so it moves and
// turns with the shelf. Its local transform is the book's local transform plus
// dx on x, so it has the same size and turn as the book.
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const shelf = book.parent;
  if (!shelf) {
    throw new Error("duplicateAlongShelf: book is not attached to a shelf");
  }

  const copy = cloneMesh(book);

  // Attach first (adds copy to shelf.children), then set the local transform
  // explicitly, since setParent keeps the world position and would change it.
  setParent(copy, shelf);

  copy.position.x = book.position.x + dx;
  copy.position.y = book.position.y;
  copy.position.z = book.position.z;
  copy.rotationQuaternion = book.rotationQuaternion
    ? { ...book.rotationQuaternion }
    : undefined;
  copy.scaling = { ...book.scaling };
  copy.material = book.material;

  addToScene(scene, copy);
  return copy;
}
