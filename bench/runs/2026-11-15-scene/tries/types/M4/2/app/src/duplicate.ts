import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Make a copy of `book` next to the original, offset by `dx` along its parent's
 * (the shelf's) x axis.
 *
 * The copy has the same size (scaling) and turn (rotation) as the book, relative to
 * the shelf, and the same parent, so it moves and turns with the shelf. The offset is
 * applied in the parent's local frame, so `dx` is in the shelf's own units and is not
 * scaled by any world transform above the shelf. The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
  const copy = cloneTransformNode(book) as Mesh;

  // Writes below must hit the copy's own transform objects, never the original's.
  if (
    copy.position === book.position ||
    copy.rotationQuaternion === book.rotationQuaternion ||
    copy.scaling === book.scaling
  ) {
    throw new Error("duplicateAlongShelf: clone shares transform objects with the original");
  }

  // Same size and turn as the book, in the shelf's frame.
  copy.scaling.x = book.scaling.x;
  copy.scaling.y = book.scaling.y;
  copy.scaling.z = book.scaling.z;
  copy.rotationQuaternion.x = book.rotationQuaternion.x;
  copy.rotationQuaternion.y = book.rotationQuaternion.y;
  copy.rotationQuaternion.z = book.rotationQuaternion.z;
  copy.rotationQuaternion.w = book.rotationQuaternion.w;
  copy.position.x = book.position.x;
  copy.position.y = book.position.y;
  copy.position.z = book.position.z;

  // Shift by dx along the shelf's x axis. A raw glTF matrix node ignores the TRS fields,
  // so for those the translation column (indices 12..14, column-major) is shifted instead.
  if (book._localMatrix) {
    const shifted = book._localMatrix.slice() as NonNullable<Mesh["_localMatrix"]>;
    shifted[12] += dx;
    copy._localMatrix = shifted;
  } else {
    copy.position.x += dx;
  }

  // Same parent as the book, so the copy stays on the shelf.
  const shelf = book.parent;
  copy.parent = shelf;
  if (shelf) {
    const siblings = (shelf as unknown as { children?: Mesh[] }).children;
    if (siblings && !siblings.includes(copy)) {
      siblings.push(copy);
    }
  }

  addToScene(scene, copy);
  return copy;
}
