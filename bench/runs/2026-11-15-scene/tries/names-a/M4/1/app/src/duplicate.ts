import type { Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createMeshFromData,
    getMeshGeometry,
    setParent,
} from "@babylonjs/lite";

/**
 * Duplicates `book` next to the original, on the same shelf.
 *
 * The book's parent is the shelf. The book's local transform (position,
 * rotation, scaling) is therefore expressed in the shelf's frame. The copy
 * gets the same parent and the same local rotation and scale, and its local
 * position is the book's local position moved `dx` along the shelf's local
 * x axis. Because the copy is parented to the shelf, it follows the shelf
 * when the shelf is moved or turned, and it keeps the book's size and turn.
 *
 * The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const geometry = getMeshGeometry(book);
    if (!geometry) {
        throw new Error(`duplicateAlongShelf: mesh "${book.name}" has no geometry to copy`);
    }

    // Engine access is not declared in scene-api.d.ts; see notes.
    const engine = scene.engine;

    const copy = createMeshFromData(
        engine,
        `${book.name}_copy`,
        geometry.positions,
        geometry.normals,
        geometry.indices,
        geometry.uvs,
        geometry.uvs2,
        geometry.tangents,
        geometry.colors,
    );

    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;
    copy.renderOrder = book.renderOrder;
    copy.renderOnTop = book.renderOnTop;

    // Local transform relative to the shelf: same turn and size as the book.
    copy.rotationQuaternion.set(
        book.rotationQuaternion.x,
        book.rotationQuaternion.y,
        book.rotationQuaternion.z,
        book.rotationQuaternion.w,
    );
    copy.scaling.set(book.scaling.x, book.scaling.y, book.scaling.z);

    // Shift along the shelf's local x axis. The shelf's frame is the book's
    // parent frame, so adding dx to local x is exactly "dx along the shelf's x".
    copy.position.set(book.position.x + dx, book.position.y, book.position.z);

    // Same shelf: the copy inherits the shelf's world transform.
    setParent(copy, book.parent);
    addToScene(scene, copy);

    return copy;
}
