import {
    addToScene,
    createMeshFromData,
    getMeshGeometry,
    setParent,
} from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

type Vec3Tuple = [number, number, number];

function copyVec3(v: readonly number[]): Vec3Tuple {
    return [v[0], v[1], v[2]];
}

/**
 * Duplicates `book` next to itself along the x axis of its parent (the shelf).
 *
 * The copy is a child of the same shelf, with the same local rotation and scale
 * as the book, and with its local position shifted so that, in world space, it
 * sits `dx` world units from the book along the shelf's x direction.
 * The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const geometry = getMeshGeometry(book);
    if (!geometry) {
        throw new Error(`duplicateAlongShelf: "${book.name}" has no CPU geometry to copy`);
    }

    const shelf = book.parent;

    // The shelf's local x axis maps to column 0 of its world matrix. With a
    // column-major layout (translation in m[12..14]) that column is m[0..2].
    // Moving by `a` along local x moves the world point by a * |column 0|,
    // so to move by `dx` world units we use a = dx / |column 0|.
    const worldMatrix = shelf ? shelf.worldMatrix : null;
    const axisLength = worldMatrix
        ? Math.hypot(worldMatrix[0], worldMatrix[1], worldMatrix[2])
        : 1;
    if (!(axisLength > 0)) {
        throw new Error("duplicateAlongShelf: the shelf's x axis has zero length");
    }
    const localDx = dx / axisLength;

    const copy = createMeshFromData(
        scene.engine,
        `${book.name}-copy`,
        geometry.positions.slice(),
        geometry.normals.slice(),
        geometry.indices.slice(),
        geometry.uvs?.slice(),
        geometry.uvs2?.slice(),
        geometry.tangents?.slice(),
        geometry.colors?.slice(),
    );

    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;
    copy.renderOrder = book.renderOrder;
    copy.renderOnTop = book.renderOnTop;
    copy.hasVertexAlpha = book.hasVertexAlpha;
    if (book.boundMin) copy.boundMin = copyVec3(book.boundMin);
    if (book.boundMax) copy.boundMax = copyVec3(book.boundMax);

    // setParent keeps world pose and registers the copy with the shelf, so it
    // follows the shelf when the shelf moves or turns. The local transform is
    // then set explicitly, since setParent would otherwise rewrite it.
    setParent(copy, shelf);

    copy.position.x = book.position.x + localDx;
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
