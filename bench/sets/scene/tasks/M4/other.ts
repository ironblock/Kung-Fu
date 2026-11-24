import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Another right answer: hang the copy under the shelf first (also in the shelf's children list),
// then shift its local x, which is in the shelf's frame.
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const copy = cloneTransformNode(book) as Mesh;
    const shelf = book.parent;
    copy.parent = shelf;
    const kids = (shelf as { children?: unknown[] } | null)?.children;
    kids?.push(copy);
    copy.position.x += dx;
    addToScene(scene, copy);
    return copy;
}
