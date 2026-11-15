import { addToScene, createMeshFromData, getMeshGeometry, setMeshVisible, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Adds to `scene` a copy of `book` that sits `dx` units from it along the
 * x axis of the book's shelf (its parent), with the same geometry, material,
 * size and turn. The copy is a child of the same shelf, so it follows the
 * shelf when the shelf is moved or turned later. `book` itself is not changed.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    // createMeshFromData needs the engine. SceneContext extends RenderingContext,
    // which is not in scene-api.d.ts; this assumes it exposes the engine as `engine`.
    const engine = scene.engine;
    if (!engine) throw new Error("duplicateAlongShelf: the scene has no engine");

    const geometry = getMeshGeometry(book);
    if (!geometry) throw new Error(`duplicateAlongShelf: cannot read the geometry of "${book.name}"`);

    // Copy the arrays so that a later edit of one mesh's vertex data does not reach the other.
    const copy = createMeshFromData(
        engine,
        `${book.name} copy`,
        geometry.positions.slice(),
        geometry.normals.slice(),
        geometry.indices.slice(),
        geometry.uvs?.slice(),
        geometry.uvs2?.slice(),
        geometry.tangents?.slice(),
        geometry.colors?.slice(),
    );

    // Look the same. All of this is set before addToScene, because the copy's draw
    // setup is built from it when it is added: factories leave material null (never
    // drawn), and receiveShadows changed after the build is ignored.
    copy.material = book.material;
    copy.receiveShadows = book.receiveShadows;
    if (book.hasVertexAlpha !== undefined) copy.hasVertexAlpha = book.hasVertexAlpha;
    if (book.renderOrder !== undefined) copy.renderOrder = book.renderOrder;
    if (book.renderOnTop !== undefined) copy.renderOnTop = book.renderOnTop;
    if (book.meshBlendingTag !== undefined) copy.meshBlendingTag = book.meshBlendingTag;
    if (book.pickable !== undefined) copy.pickable = book.pickable;

    // Lights that leave out the book, or light only the book, treat the copy the same way.
    for (const light of scene.lights) {
        if (light.excludedMeshes?.has(book)) {
            light.excludedMeshes = new Set([...light.excludedMeshes, copy]);
        }
        if (light.includedOnlyMeshes?.has(book)) {
            light.includedOnlyMeshes = new Set([...light.includedOnlyMeshes, copy]);
        }
    }

    // Put the copy on the shelf with setParent, not `copy.parent = shelf`: only setParent
    // puts it in shelf.children, so hiding or removing the shelf reaches it too.
    // setParent keeps the copy's current world position, so call it while the copy is
    // still at the origin, then set its place on the shelf in the shelf's own space.
    const shelf = book.parent;
    if (shelf) setParent(copy, shelf);

    // book.position is in the shelf's space, so moving along the shelf's x axis means
    // adding to x. To keep the distance dx units even if the shelf (or something above
    // it) is scaled, divide by the length of the shelf's x axis in world space, which
    // is the first three entries of its world matrix. With no scaling this is 1.
    let step = dx;
    if (shelf) {
        const m: ArrayLike<number> = shelf.worldMatrix;
        const xScale = Math.hypot(m[0], m[1], m[2]);
        if (xScale > 0) step = dx / xScale;
    }

    copy.position.x = book.position.x + step;
    copy.position.y = book.position.y;
    copy.position.z = book.position.z;

    // Copy the turn from the quaternion (which the Euler `rotation` is built on), so it
    // is exact even at angles where Euler angles are ambiguous.
    const q = book.rotationQuaternion;
    copy.rotationQuaternion.x = q.x;
    copy.rotationQuaternion.y = q.y;
    copy.rotationQuaternion.z = q.z;
    copy.rotationQuaternion.w = q.w;

    copy.scaling.x = book.scaling.x;
    copy.scaling.y = book.scaling.y;
    copy.scaling.z = book.scaling.z;

    if (book.visible === false) setMeshVisible(copy, false);

    // Not done here: casting a shadow. Only meshes in a shadow generator's caster list
    // cast, and a mesh added later is not put in it. That list belongs to the caller
    // and cannot be read from the scene through the declared API, so if the book casts
    // a shadow, the caller has to add the copy too (e.g. casters.push(copy)).

    // Add the copy itself (not the shelf, which is already in the scene). Adding a mesh
    // that is already there puts it in scene.meshes twice, so check first.
    if (!scene.meshes.includes(copy)) addToScene(scene, copy);

    return copy;
}
