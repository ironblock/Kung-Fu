import {
    addToScene,
    createMeshFromData,
    getMeshGeometry,
    setParent,
} from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicate `book` next to itself along its shelf.
 *
 * The copy is parented to the same shelf as the original and given the same
 * local turn and size. Its local position is the original's local position
 * plus `dx` on the shelf's local x axis. Because the copy is a child of the
 * shelf, it follows the shelf when the shelf is moved or turned.
 *
 * The original is only read, never modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const geometry = getMeshGeometry(book);
    if (!geometry) {
        throw new Error(`duplicateAlongShelf: "${book.name}" has no CPU geometry to copy`);
    }

    // Same vertex data, new GPU resources.
    const copy = createMeshFromData(
        scene.engine,
        `${book.name}-copy`,
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

    // Attach to the same shelf first, so the position below is the shelf-local one.
    // setParent also registers the copy as a child, so it moves with the shelf.
    setParent(copy, book.parent);

    // Same turn and size as the original, as local values under the shelf.
    copy.position.x = book.position.x + dx;
    copy.position.y = book.position.y;
    copy.position.z = book.position.z;

    copy.rotationQuaternion.x = book.rotationQuaternion.x;
    copy.rotationQuaternion.y = book.rotationQuaternion.y;
    copy.rotationQuaternion.z = book.rotationQuaternion.z;
    copy.rotationQuaternion.w = book.rotationQuaternion.w;

    copy.scaling.x = book.scaling.x;
    copy.scaling.y = book.scaling.y;
    copy.scaling.z = book.scaling.z;

    addToScene(scene, copy);
    return copy;
}
