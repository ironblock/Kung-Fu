import type { Mesh, SceneContext, SceneNode } from "@babylonjs/lite";
import { addToScene, cloneTransformNode } from "@babylonjs/lite";

/**
 * Duplicate `book` on its shelf (the book's parent), `dx` units along the
 * shelf's own x axis. The copy is a child of the same shelf, so it moves and
 * turns with it. The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent as SceneNode | null;
    if (!shelf) {
        throw new Error("duplicateAlongShelf: book is not attached to a shelf");
    }

    const copy = cloneTransformNode(book) as Mesh;

    // The book's position is local to the shelf. Offsetting local x by dx moves
    // the copy dx along the shelf's x axis, whatever the shelf's place or turn.
    copy.position.set(book.position.x + dx, book.position.y, book.position.z);

    // Attach to the shelf: set the parent and list the copy in its children,
    // so the shelf's transform and visibility/removal apply to the copy.
    copy.parent = shelf;
    if (!shelf.children.includes(copy)) {
        shelf.children.push(copy);
    }

    addToScene(scene, copy);
    return copy;
}
