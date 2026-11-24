import type { Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData, getMeshGeometry, setParent } from "@babylonjs/lite";

type EngineArg = Parameters<typeof createMeshFromData>[0];

/**
 * Duplicates `book` as a sibling under the same shelf (the book's parent),
 * offset by `dx` along the shelf's local x axis.
 *
 * The book's position is expressed in its parent's (the shelf's) local space,
 * so adding `dx` to position.x is exactly "dx along the shelf's x direction",
 * whatever the shelf's position, rotation, or parent chain is. Because the copy
 * is parented to the same shelf, it follows the shelf when the shelf moves or turns.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const geo = getMeshGeometry(book);
    if (!geo) {
        throw new Error(`duplicateAlongShelf: no CPU geometry available for "${book.name}"`);
    }

    // Assumed: the scene exposes its engine. Not confirmed by the declarations provided.
    const engine = (scene as unknown as { engine?: EngineArg }).engine;
    if (!engine) {
        throw new Error("duplicateAlongShelf: could not get the engine from the scene");
    }

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
    copy.pickable = book.pickable;
    copy.boundMin = book.boundMin ? [...book.boundMin] : undefined;
    copy.boundMax = book.boundMax ? [...book.boundMax] : undefined;

    // Same parent (the shelf) so the copy moves and turns with it.
    setParent(copy, book.parent);

    // Local transform, relative to the shelf: same turn and size, shifted by dx on the shelf's x axis.
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
