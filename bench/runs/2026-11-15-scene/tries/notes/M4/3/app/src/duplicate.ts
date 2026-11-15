import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates a book mesh on its shelf, `dx` units further along the shelf's x axis.
 *
 * The book's local position is expressed in its shelf's frame, so the copy is
 * parented to the same shelf with the same local rotation and scale and with
 * its local x position shifted by `dx`. That keeps the copy on the shelf: moving
 * or turning the shelf moves the copy too. The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent;
    if (!shelf) {
        throw new Error("duplicateAlongShelf: book has no shelf (parent)");
    }

    // cloneTransformNode is typed as returning SceneNode; for a mesh it yields the mesh copy.
    const copy = cloneTransformNode(book) as Mesh;
    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;

    // Attach to the shelf. Setting `parent` keeps the local transform (no world-preserving
    // rewrite), and the child is also listed in the shelf's children so that
    // scene-level operations on the shelf (add, hide, remove) reach the copy.
    copy.parent = shelf;
    const shelfChildren = (shelf as unknown as { children: Mesh["children"] }).children;
    if (!shelfChildren.includes(copy)) {
        shelfChildren.push(copy);
    }

    // Local transform in the shelf's frame: same turn and size as the book, shifted by dx along shelf x.
    copy.position.set(book.position.x + dx, book.position.y, book.position.z);
    copy.scaling.set(book.scaling.x, book.scaling.y, book.scaling.z);

    addToScene(scene, copy);
    return copy;
}
