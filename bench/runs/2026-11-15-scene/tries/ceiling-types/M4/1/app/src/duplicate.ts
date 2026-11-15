import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Make a copy of `book` on the same shelf, `dx` units further along the shelf's own x axis.
 *
 * A book's position is local to its parent (the shelf), so "the book's place on the shelf plus dx
 * in the shelf's x direction" is its local position plus (dx, 0, 0). Wherever the shelf is and
 * however it is turned, the shelf's world matrix carries that offset along its own x axis. And
 * because the copy keeps the shelf as its parent, it moves with the shelf afterwards.
 *
 * `dx` is measured in shelf-local units, so it matches world units unless the shelf itself is scaled.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent;

    // Deep clone: shares the book's ref-counted GPU geometry and copies its material, local TRS
    // (so the same size and turn) and any child meshes. The original book is not modified.
    const copy = cloneTransformNode(book) as Mesh;

    // Put the copy on the same shelf. Assign `parent` directly instead of using setParent(): the
    // cloned TRS is already shelf-local. setParent() would keep the copy's current world transform
    // instead, and while the copy has no parent that is not where the book is.
    if (copy.parent !== shelf) copy.parent = shelf;
    if (shelf && "children" in shelf && Array.isArray(shelf.children) && !shelf.children.includes(copy)) {
        // Keep the shelf's `children` list in step, so traversals (visibility, cloning or removing
        // the shelf) include the copy.
        shelf.children.push(copy);
    }

    // A node built from a raw glTF matrix ignores TRS writes. The copy now sits exactly where the
    // book does, so calling setParent() with the same shelf turns it into editable shelf-local TRS
    // without moving it.
    if (copy._localMatrix !== undefined || copy._localMatrixLocked) setParent(copy, shelf);

    // One step along the shelf's own x axis, in shelf-local coordinates.
    copy.position.x += dx;

    addToScene(scene, copy);
    return copy;
}
