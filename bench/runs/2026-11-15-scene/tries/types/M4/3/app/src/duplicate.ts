import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext, SceneNode } from "@babylonjs/lite";

/**
 * Duplicate `book` beside itself along its shelf's x axis.
 *
 * The copy is a child of the same shelf, so it moves and turns with the shelf.
 * Its local transform is the book's local transform, shifted by `dx` world units
 * along the shelf's +x direction, where that direction is the shelf's local x axis
 * as it sits in the world (rotation, mirroring and scale of the shelf included).
 * The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent as SceneNode | null;
    if (!shelf) {
        throw new Error("duplicateAlongShelf: the book has no shelf (parent)");
    }

    // Column 0 of the shelf's column-major world matrix is the image of its local x axis.
    // Its length is the shelf's x scale, so dividing by it turns a world distance into
    // the shelf-local offset that yields a world displacement of exactly `dx`.
    const m = shelf.worldMatrix;
    const axisLength = Math.hypot(m[0], m[1], m[2]);
    if (!(axisLength > 0)) {
        throw new Error("duplicateAlongShelf: the shelf has a degenerate x axis");
    }
    const localOffsetX = dx / axisLength;

    // The clone's local transform is the book's; its parent is not assumed to be kept.
    const copy = cloneTransformNode(book) as Mesh;

    // Attach to the shelf directly, so the copy follows the shelf. setParent is not used
    // because it keeps the child's world transform, which would undo the offset below.
    copy.parent = shelf;
    shelf.children.push(copy);

    // Position is in shelf-local space, since the book's parent is the shelf.
    copy.position.x = book.position.x + localOffsetX;
    copy.position.y = book.position.y;
    copy.position.z = book.position.z;

    addToScene(scene, copy);
    return copy;
}
