import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// cloneTransformNode copies the local TRS but leaves the copy without a parent, so put it back
// under the book's parent; its local position is then in the shelf's frame.
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const copy = cloneTransformNode(book) as Mesh;
    copy.parent = book.parent;
    copy.position.set(book.position.x + dx, book.position.y, book.position.z);
    addToScene(scene, copy);
    return copy;
}
