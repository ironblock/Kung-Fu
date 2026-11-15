import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates a book mesh next to the original, on the same shelf.
 *
 * The copy is parented to the same shelf as the book, so it follows the shelf
 * when the shelf is moved or turned. Its local transform (size and turn relative
 * to the shelf) is copied from the book; only its position is offset.
 *
 * `dx` is a world-space distance along the shelf's own x axis. The book's local
 * position is expressed in shelf space, where a step of 1 along x is
 * 1 / |worldX| world units, with worldX the length of the shelf's world x axis.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const shelf = book.parent;
  if (!shelf) {
    throw new Error("duplicateAlongShelf: book has no shelf (parent)");
  }

  // Clone shares geometry and material with the book, and has parent null.
  const copy = cloneTransformNode(book) as Mesh;

  // setParent updates both the copy's parent and the shelf's children list,
  // so that addToScene and shelf transforms include the copy.
  setParent(copy, shelf);

  // Length of the shelf's world x axis. Row-vector convention: the first row of
  // the 4x4 world matrix (elements 0..2) is the transformed x axis.
  const m = shelf.worldMatrix;
  const worldXLength = Math.hypot(m[0], m[1], m[2]);
  if (!(worldXLength > 0)) {
    throw new Error("duplicateAlongShelf: shelf has a degenerate x axis");
  }

  // Offset in shelf-local units that moves dx world units along the shelf's x axis.
  copy.position.x = book.position.x + dx / worldXLength;
  copy.position.y = book.position.y;
  copy.position.z = book.position.z;

  addToScene(scene, copy);
  return copy;
}
