import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates `book` next to itself along the shelf's own x axis.
 *
 * The copy is parented to the same shelf, so it follows the shelf when the
 * shelf is moved or turned. Its local position is the book's local position
 * plus `dx` on the shelf's x axis, and its local rotation and scale match the
 * book's. The original is not changed.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const shelf = book.parent;
  if (!shelf) {
    throw new Error("duplicateAlongShelf: book is not attached to a shelf");
  }

  // The book's local transform, relative to the shelf. Read it before the copy
  // is parented, so the values are exactly what the book has.
  const bookPos = book.position;
  const bookRot = book.rotationQuaternion;
  const bookScale = book.scaling;

  const copy = cloneTransformNode(book) as Mesh;

  // setParent adds the copy to shelf.children and keeps its world transform,
  // which changes its local values. The local values are written again below.
  setParent(copy, shelf);

  copy.position.set(bookPos.x + dx, bookPos.y, bookPos.z);
  copy.rotationQuaternion.set(bookRot.x, bookRot.y, bookRot.z, bookRot.w);
  copy.scaling.set(bookScale.x, bookScale.y, bookScale.z);

  addToScene(scene, copy);
  return copy;
}
