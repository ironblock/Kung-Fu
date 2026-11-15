import {
    addToScene,
    cloneTransformNode,
    setParent,
} from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates `book` as a sibling on the same shelf (its parent), offset by
 * `dx` along the shelf's own x axis.
 *
 * The copy is parented to the shelf, so it follows the shelf when the shelf
 * is moved or turned. Its local position is the book's local position plus
 * `dx` on x; book.position is local to the shelf, so this is the shelf's x
 * direction whatever the shelf's rotation. Rotation and scale are taken from
 * the clone of `book`, so the copy keeps its size and turn.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    // Read the original's local placement before touching anything.
    const x = book.position.x + dx;
    const y = book.position.y;
    const z = book.position.z;
    const shelf = book.parent;

    const copy = cloneTransformNode(book) as Mesh;
    addToScene(scene, copy);

    // setParent adds the copy to shelf.children and keeps its world transform;
    // the local position is then set explicitly below.
    setParent(copy, shelf);
    copy.position.set(x, y, z);

    return copy;
}
