import { addToScene, initSceneNodeTransform, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Creates a copy of `book` that sits on the same shelf (the book's parent),
 * `dx` units further along the shelf's own x axis.
 *
 * The copy is parented to the same shelf, so it follows the shelf when the
 * shelf is moved or turned. It shares the book's GPU geometry and material,
 * copies its local turn and size, and leaves the original untouched.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    if (book.skeleton || book.morphTargets || book.vat || book.thinInstances) {
        throw new Error(
            "duplicateAlongShelf: skinned, morph-target, VAT-animated or thin-instanced books are not supported",
        );
    }

    // A child's position is expressed in its parent's (the shelf's) local frame.
    // The shelf's own x axis is that frame's x axis, so offsetting x by dx moves
    // the copy along the shelf no matter where the shelf is or how it is turned.
    const p = book.position;
    const q = book.rotationQuaternion;
    const s = book.scaling;

    const copy = initSceneNodeTransform<Mesh>(
        {
            name: `${book.name}_copy`,
            _gpu: book._gpu,
            material: book.material,
            receiveShadows: book.receiveShadows,
            pickable: book.pickable,
            renderOrder: book.renderOrder,
            renderOnTop: book.renderOnTop,
            hasVertexAlpha: book.hasVertexAlpha,
            boundMin: book.boundMin,
            boundMax: book.boundMax,
            meshBlendingTag: book.meshBlendingTag,
            _skipColorDraw: book._skipColorDraw,
            _topology: book._topology,
        },
        p.x + dx,
        p.y,
        p.z,
        q.x,
        q.y,
        q.z,
        q.w,
        s.x,
        s.y,
        s.z,
    );

    // Same parent as the book: the copy stays on the same shelf.
    setParent(copy, book.parent);
    addToScene(scene, copy);
    return copy;
}
