import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates `book` next to itself along its shelf.
 *
 * The copy is parented to the same shelf as the original, with the same local
 * rotation and scale, and its local position shifted by `dx` on the shelf's
 * x axis. Because it is a child of the shelf, moving or turning the shelf
 * moves the copy with it. The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent;
    if (!shelf) {
        throw new Error("duplicateAlongShelf: book has no shelf");
    }

    // Clone the book's subtree; this adds nothing to any scene.
    const copy = cloneTransformNode(book) as Mesh;

    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;

    // Attach to the shelf. Setting `parent` keeps the local transform (no world
    // compensation); the children entry is what lets the shelf's moves and
    // scene operations reach the copy.
    copy.parent = shelf;
    if (!shelf.children.includes(copy)) {
        shelf.children.push(copy);
    }

    // The book's position is local to the shelf, so shifting x by dx moves
    // the copy dx along the shelf's own x axis.
    const p = book.position;
    copy.position = [p[0] + dx, p[1], p[2]];

    addToScene(scene, copy);
    return copy;
}
