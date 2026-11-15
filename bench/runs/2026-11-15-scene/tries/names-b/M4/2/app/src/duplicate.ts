import type { Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createMeshFromData,
    getMeshGeometry,
    setParent,
} from "@babylonjs/lite";

/**
 * Duplicates `book` as a sibling on the same shelf (the book's parent).
 *
 * The copy gets the book's local transform (position, rotation, scaling), so it
 * keeps the same size and turn relative to the shelf, and it is parented to the
 * same shelf, so it follows the shelf when the shelf moves or turns.
 *
 * The copy's local position is the book's local position plus `dx` on the
 * shelf's local x axis. `dx` is in shelf-local units, so a scaled shelf scales
 * the world distance by the same factor.
 *
 * The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const geo = getMeshGeometry(book);
    if (!geo) {
        throw new Error("duplicateAlongShelf: book has no CPU-side geometry to copy");
    }

    // ASSUMPTION: the engine is reachable from the scene (RenderingContext).
    const engine = (scene as SceneContext & { engine: Parameters<typeof createMeshFromData>[0] }).engine;

    const copy = createMeshFromData(
        engine,
        `${book.name}_copy`,
        geo.positions,
        geo.normals,
        geo.indices,
        geo.uvs,
        geo.uvs2,
        geo.tangents,
        geo.colors,
    );

    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;

    // Same local turn and size as the book.
    copy.rotationQuaternion.x = book.rotationQuaternion.x;
    copy.rotationQuaternion.y = book.rotationQuaternion.y;
    copy.rotationQuaternion.z = book.rotationQuaternion.z;
    copy.rotationQuaternion.w = book.rotationQuaternion.w;

    copy.scaling.x = book.scaling.x;
    copy.scaling.y = book.scaling.y;
    copy.scaling.z = book.scaling.z;

    // Book's place on the shelf, plus dx along the shelf's local x axis.
    copy.position.x = book.position.x + dx;
    copy.position.y = book.position.y;
    copy.position.z = book.position.z;

    // Same shelf as the book, so the copy moves with it.
    setParent(copy, book.parent);
    addToScene(scene, copy);

    return copy;
}
