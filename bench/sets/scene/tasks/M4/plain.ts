import { addToScene, cloneTransformNode } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Like Babylon.js mesh.clone(): the copy keeps the original's parent, so shifting its local
// position by dx moves it along the shelf's x axis.
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const copy = cloneTransformNode(book) as Mesh;
    copy.position.x += dx;
    addToScene(scene, copy);
    return copy;
}
