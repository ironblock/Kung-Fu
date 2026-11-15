import { addToScene, cloneTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Duplicates `book` next to itself along the shelf's own x axis.
 *
 * The copy is parented to the same shelf as the original, so it moves and
 * turns with the shelf. Its local transform (position, turn, size) is the
 * original's local transform, with `dx` added to the local x position.
 * Because the copy is parented, that offset is taken in the shelf's frame.
 *
 * The original is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    // cloneTransformNode is declared to return SceneNode; for a mesh it returns
    // a mesh sharing geometry, material and thin instances with `book`.
    const copy = cloneTransformNode(book) as Mesh;

    // Same shelf as the original. setParent updates both parent and children lists.
    setParent(copy, book.parent);

    // Copy the local transform of the original, then shift along the shelf's x.
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

    copy.receiveShadows = book.receiveShadows;

    addToScene(scene, copy);
    return copy;
}
