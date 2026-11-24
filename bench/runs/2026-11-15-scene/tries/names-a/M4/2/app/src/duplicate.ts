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
 * The book's parent is the shelf. Its local position, rotation and scaling are
 * expressed in shelf space, so the copy is parented to the same shelf with the
 * same local rotation and scaling, and its local position is offset by `dx`
 * along the shelf's local x axis. Because the copy is a child of the shelf, it
 * follows the shelf when the shelf is moved or turned.
 *
 * The original is only read, never modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent;
    if (!shelf) {
        throw new Error("duplicateAlongShelf: book has no shelf (parent)");
    }
    if (book.skeleton || book.morphTargets || book.vat || book.thinInstances) {
        throw new Error("duplicateAlongShelf: skinned, morphed, VAT or thin-instanced books are not supported");
    }

    const geometry = getMeshGeometry(book);
    if (!geometry) {
        throw new Error(`duplicateAlongShelf: no CPU geometry available for "${book.name}"`);
    }

    // Assumes SceneContext exposes its engine (see note in the report).
    const engine = scene.engine;
    const copy = createMeshFromData(
        engine,
        `${book.name}-copy`,
        geometry.positions,
        geometry.normals,
        geometry.indices,
        geometry.uvs,
        geometry.uvs2,
        geometry.tangents,
        geometry.colors,
    );

    // Same look and same size and turn, relative to the shelf.
    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;
    copy.renderOrder = book.renderOrder;
    copy.renderOnTop = book.renderOnTop;
    copy.pickable = book.pickable;
    copy.meshBlendingTag = book.meshBlendingTag;
    copy.hasVertexAlpha = book.hasVertexAlpha;
    copy.boundMin = book.boundMin ? [...book.boundMin] : undefined;
    copy.boundMax = book.boundMax ? [...book.boundMax] : undefined;

    copy.rotationQuaternion.x = book.rotationQuaternion.x;
    copy.rotationQuaternion.y = book.rotationQuaternion.y;
    copy.rotationQuaternion.z = book.rotationQuaternion.z;
    copy.rotationQuaternion.w = book.rotationQuaternion.w;

    copy.scaling.x = book.scaling.x;
    copy.scaling.y = book.scaling.y;
    copy.scaling.z = book.scaling.z;

    // Same place on the shelf, shifted by dx along the shelf's x axis.
    copy.position.x = book.position.x + dx;
    copy.position.y = book.position.y;
    copy.position.z = book.position.z;

    // Attach to the shelf (not to the book), so the copy moves with the shelf.
    setParent(copy, shelf);
    addToScene(scene, copy);

    return copy;
}
