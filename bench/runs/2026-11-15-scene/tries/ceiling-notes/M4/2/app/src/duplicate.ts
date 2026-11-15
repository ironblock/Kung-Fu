import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Adds to `scene` a copy of `book` on the same shelf (the book's parent),
 * `dx` shelf units further along the shelf's own x axis. The copy has the
 * book's material, geometry, size and turn, and moves with the shelf.
 *
 * The offset is added to the book's local position, which is already in the
 * shelf's frame. The shelf's x axis in that frame is just (1, 0, 0), so the
 * result is right wherever the shelf is and however it is turned. We never
 * work out the axis from the shelf's Euler angles (Babylon Lite composes
 * them as qx*qy*qz, not the Babylon.js order).
 *
 * If the book has no parent, the offset is along world x and the copy has no
 * parent either.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    const shelf = book.parent;

    // Shares the book's material and geometry. Shared buffers outlive either
    // mesh being removed. The clone is named book.name + "_clone", its
    // children are cloned too, and its parent starts as null.
    const copy = cloneTransformNode(book) as Mesh;

    // Use setParent, not `copy.parent = shelf`. A plain assignment leaves the
    // copy out of shelf.children, so a later addToScene/removeFromScene of the
    // shelf would skip it.
    if (shelf) setParent(copy, shelf);

    // Write the local transform after parenting, so it ends up right whether
    // or not setParent keeps the world transform.
    const s = book.scaling;
    copy.scaling.x = s.x;
    copy.scaling.y = s.y;
    copy.scaling.z = s.z;

    // Writing one component at a time passes through non-unit quaternions,
    // so only do it when the clone's rotation actually differs.
    const q = book.rotationQuaternion;
    const cq = copy.rotationQuaternion;
    if (cq.x !== q.x || cq.y !== q.y || cq.z !== q.z || cq.w !== q.w) {
        cq.x = q.x;
        cq.y = q.y;
        cq.z = q.z;
        cq.w = q.w;
    }

    const p = book.position;
    copy.position.x = p.x + dx;
    copy.position.y = p.y;
    copy.position.z = p.z;

    // Shadow receiving is fixed when the mesh is built (on addToScene), so
    // set it first.
    copy.receiveShadows = book.receiveShadows;

    // Lights that pick meshes by object should treat the copy like the book.
    // Otherwise a light limited to the book would leave the copy unlit.
    for (const light of scene.lights) {
        if (light.includedOnlyMeshes?.has(book)) {
            light.includedOnlyMeshes = new Set([...light.includedOnlyMeshes, copy]);
        }
        if (light.excludedMeshes?.has(book)) {
            light.excludedMeshes = new Set([...light.excludedMeshes, copy]);
        }
    }

    // Add only the copy (with its cloned children). Re-adding the shelf would
    // list its other meshes in scene.meshes a second time.
    addToScene(scene, copy);
    return copy;
}
