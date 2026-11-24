import {
    addToScene,
    createMeshFromData,
    getMeshGeometry,
    setParent,
} from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Makes a copy of `book` on the same shelf (its parent), `dx` units further
 * along the shelf's own x axis. The copy has the book's size and turn, and it
 * is added to the scene. The original is not changed.
 *
 * `dx` is in the shelf's local units, so if the shelf itself is scaled, the
 * world distance is dx times that scale.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const geometry = getMeshGeometry(book);
    if (!geometry) {
        throw new Error(`duplicateAlongShelf: "${book.name}" has no geometry to copy`);
    }

    // ASSUMPTION: the engine is reachable as scene.engine. The declarations I
    // was given do not show this, so check it when type-checking.
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

    // Attach to the same parent first. setParent keeps the world position, so
    // the local transform must be written after it.
    setParent(copy, book.parent);

    // The book's local values are already in the shelf's frame. Copying them
    // and adding dx on the local x axis puts the copy dx along the shelf's x
    // axis, wherever the shelf is and however it is turned.
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
