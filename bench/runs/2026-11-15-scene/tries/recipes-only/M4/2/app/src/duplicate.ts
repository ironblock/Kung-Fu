import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates `book` on its shelf (the book's parent) and offsets the copy by
 * `dx` along the shelf's own x axis.
 *
 * The copy is parented to the same shelf, so it follows the shelf when the
 * shelf is moved or turned. Its local position is the book's local position
 * plus `dx` in the shelf's x direction. The clone keeps the book's size and
 * turn (local rotation/scale) and shares its geometry and material. The
 * original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const shelf = book.parent;
  if (!shelf) {
    throw new Error("duplicateAlongShelf: the book is not attached to a shelf");
  }

  // Clone first: cloning does not add the copy to the scene.
  const copy = cloneTransformNode(book) as Mesh;

  // setParent keeps the copy's world position and registers it in shelf.children,
  // so the shelf owns the copy (moves, hides and is removed with it).
  setParent(copy, shelf);

  // Local position is in the shelf's space, so adding dx to x moves along the shelf's x axis.
  // Assumes the shelf has no scale; with a scaled shelf, dx is in shelf-local units.
  copy.position.set(book.position.x + dx, book.position.y, book.position.z);

  addToScene(scene, copy);
  return copy;
}
