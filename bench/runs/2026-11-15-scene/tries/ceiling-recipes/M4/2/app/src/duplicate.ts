import {
    addToScene,
    cloneTransformNode,
    setMeshVisible,
    setShadowTaskCasterMeshes,
} from "@babylonjs/lite";
import type { Mesh, SceneContext, SceneNode, ShadowGenerator } from "@babylonjs/lite";

/**
 * Makes a copy of `book` on the same shelf (its parent), `dx` units along the
 * shelf's own x axis, and adds it to `scene`. The original is not changed.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    // Same geometry and the same material object, same local turn and size.
    // Cloning does not add the copy to the scene or attach it to the shelf.
    const copy = cloneTransformNode(book) as Mesh;

    // book.position is the book's place in the shelf's own frame, where the
    // shelf's x axis is (1, 0, 0). Adding dx to the local x therefore moves
    // the copy along the shelf, however the shelf is placed or turned.
    const p = book.position;
    copy.position.set(p.x + dx, p.y, p.z);

    // Attach to the shelf. Setting only .parent makes the copy follow the
    // shelf's world matrix, but without being in shelf.children it would not be
    // hidden or removed with the shelf. setParent() is not used because it keeps
    // the current world position, which would reinterpret the local position.
    const shelf = book.parent;
    if (shelf) {
        copy.parent = shelf;
        const children = (shelf as Partial<SceneNode>).children;
        if (Array.isArray(children) && !children.includes(copy)) {
            children.push(copy);
        }
    }

    // Light like the book. Lights that exclude or only include the book by
    // object should treat the copy the same way. This is set before the copy is
    // added so its first build sees it. Sets are replaced, not changed in place.
    copy.receiveShadows = book.receiveShadows;
    for (const light of scene.lights) {
        if (light.excludedMeshes?.has(book) && !light.excludedMeshes.has(copy)) {
            light.excludedMeshes = new Set([...light.excludedMeshes, copy]);
        }
        if (light.includedOnlyMeshes?.has(book) && !light.includedOnlyMeshes.has(copy)) {
            light.includedOnlyMeshes = new Set([...light.includedOnlyMeshes, copy]);
        }
    }

    addToScene(scene, copy);

    // A hidden book (or a book on a hidden shelf) gives a hidden copy.
    if (book.visible === false) {
        setMeshVisible(copy, false);
    }

    // If the book casts shadows, the copy should too: add it to the caster
    // list of every shadow generator that has the book.
    const generators = new Set<ShadowGenerator>(scene.shadowGenerators);
    for (const light of scene.lights) {
        if (light.shadowGenerator) generators.add(light.shadowGenerator);
    }
    for (const sg of generators) {
        const casters = sg._shadowTaskState?._casterMeshes ?? sg._preloadPending;
        if (casters && casters.includes(book) && !casters.includes(copy)) {
            setShadowTaskCasterMeshes(sg, [...casters, copy]);
        }
    }

    return copy;
}
