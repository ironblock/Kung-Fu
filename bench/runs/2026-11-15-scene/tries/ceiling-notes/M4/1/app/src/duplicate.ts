import { addToScene, cloneTransformNode, setMeshVisible, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

// Note numbers below refer to ../scene-notes.md.

/**
 * Makes a copy of `book` on the same shelf (`book.parent`), `dx` units further
 * along the shelf's own x axis, and adds it to `scene`.
 *
 * The copy gets the book's local position on the shelf plus `dx` on the shelf's
 * local x, and the book's local rotation and scaling. Because it is a child of
 * the shelf, it ends up in the right place wherever the shelf is and however it
 * is turned, and it moves with the shelf afterwards. `dx` is in the shelf's
 * local units, which are world units unless the shelf (or one of its parents)
 * is scaled.
 *
 * `book` itself is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    if (!Number.isFinite(dx)) {
        throw new RangeError(`duplicateAlongShelf: dx must be a finite number, got ${dx}`);
    }

    const shelf = book.parent;

    // Shares the book's GPU geometry and adds nothing to any scene (note 29).
    const copy = cloneTransformNode(book) as Mesh;

    // Make it look the same. This has to happen before addToScene: a mesh added
    // with a null material joins no render group (note 32), and receiveShadows
    // set after the mesh is built is not picked up (note 1).
    for (const key of LOOK_KEYS) copyField(book, copy, key);
    if (book.visible === false) setMeshVisible(copy, false);

    // Lights can include/exclude meshes by object or by id (notes 12, 13). Give
    // the copy its own id (if the book has one) and put it in the same light
    // sets as the book, so every light treats it exactly like the book.
    copy.id = book.id === undefined ? undefined : unusedId(scene, `${book.id}_clone`);
    mirrorLightFilters(scene, book, copy);

    // Attach to the shelf properly (in shelf.children, note 6), so hiding,
    // removing or cloning the shelf also covers the copy (notes 10, 24, 29).
    attachTo(copy, shelf);

    // setParent keeps the world transform, which rewrites the local one, so
    // set the local transform only after attaching. These values are relative
    // to the shelf, so the shelf's own x axis is simply local x here.
    const p = book.position;
    copy.position.set(p.x + dx, p.y, p.z);
    const q = book.rotationQuaternion; // rotation is just a view of this (note 25)
    copy.rotationQuaternion.set(q.x, q.y, q.z, q.w);
    const s = book.scaling;
    copy.scaling.set(s.x, s.y, s.z);

    addToScene(scene, copy);
    return copy;
}

type LookKey = "material" | "receiveShadows" | "hasVertexAlpha" | "renderOrder" | "renderOnTop" | "pickable";

const LOOK_KEYS: readonly LookKey[] = [
    "material",
    "receiveShadows",
    "hasVertexAlpha",
    "renderOrder",
    "renderOnTop",
    "pickable",
];

function copyField<K extends LookKey>(from: Mesh, to: Mesh, key: K): void {
    if (to[key] !== from[key]) to[key] = from[key];
}

/** Makes `shelf` the parent of `copy` and puts the copy in `shelf.children`. */
function attachTo(copy: Mesh, shelf: Mesh["parent"]): void {
    const siblings = shelf ? childrenOf(shelf) : undefined;
    if (copy.parent === shelf && siblings && !siblings.includes(copy)) {
        // Only the parent pointer is set; setParent would see "already parented
        // to shelf" and do nothing, so clear the pointer first.
        copy.parent = null;
    }
    if (copy.parent !== shelf) setParent(copy, shelf);
}

function childrenOf(node: object): readonly unknown[] | undefined {
    const children = (node as { children?: unknown }).children;
    return Array.isArray(children) ? children : undefined;
}

/** Returns `base`, or `base2`, `base3`, ..., whichever no mesh or light filter uses yet. */
function unusedId(scene: SceneContext, base: string): string {
    const taken = new Set<string>();
    for (const mesh of scene.meshes) {
        if (mesh.id !== undefined) taken.add(mesh.id);
    }
    for (const light of scene.lights) {
        light.includedOnlyMeshIds?.forEach((id) => taken.add(id));
        light.excludedMeshIds?.forEach((id) => taken.add(id));
    }
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}${n}`;
    return id;
}

/**
 * Adds `copy` (and its id) to every light filter set in the scene that holds
 * `book` (or its id). Sets that get an entry already held the book, so no set
 * goes from empty to non-empty and no other mesh's lighting changes.
 */
function mirrorLightFilters(scene: SceneContext, book: Mesh, copy: Mesh): void {
    const bookId = book.id;
    const copyId = copy.id;
    const mirrorIds = bookId !== undefined && copyId !== undefined && copyId !== bookId;

    for (const light of scene.lights) {
        const included = light.includedOnlyMeshes;
        if (included?.has(book)) light.includedOnlyMeshes = withEntry(included, copy);
        const excluded = light.excludedMeshes;
        if (excluded?.has(book)) light.excludedMeshes = withEntry(excluded, copy);

        if (mirrorIds) {
            const includedIds = light.includedOnlyMeshIds;
            if (includedIds?.has(bookId)) light.includedOnlyMeshIds = withEntry(includedIds, copyId);
            const excludedIds = light.excludedMeshIds;
            if (excludedIds?.has(bookId)) light.excludedMeshIds = withEntry(excludedIds, copyId);
        }
    }
}

function withEntry<T>(set: ReadonlySet<T>, value: T): ReadonlySet<T> {
    return set.has(value) ? set : new Set([...set, value]);
}
