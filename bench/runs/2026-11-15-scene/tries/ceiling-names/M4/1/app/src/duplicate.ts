import type { Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, initMeshTransform, setMeshVisible, setParent } from "@babylonjs/lite";

/**
 * Mesh fields that decide how a mesh looks: geometry, material, shading,
 * shadow and render flags. The copy takes them over unchanged, so it shares
 * the book's GPU geometry and material instead of uploading its own.
 * Transform, parent, identity and scene-bookkeeping fields are left out on
 * purpose. The copy gets its own fresh transform state.
 */
const APPEARANCE_KEYS = [
    "material",
    "receiveShadows",
    "_skipColorDraw",
    "renderOrder",
    "renderOnTop",
    "hasVertexAlpha",
    "pickable",
    "meshBlendingTag",
    "_shadowMaxCascade",
    "_authoredSign",
    "skeleton",
    "vat",
    "morphTargets",
    "thinInstances",
    "_runtimeThinBuild",
    "_expandWorldBounds",
    "_gpu",
    "_topology",
    "_linePointCounts",
    "_dashedLineOptions",
    "_cpuPositions",
    "_cpuNormals",
    "_cpuUvs",
    "_cpuUv2s",
    "_cpuTangents",
    "_cpuColors",
    "_cpuIndices",
    "_cpuGpuIndices",
    "_cpuIndexFormat",
] as const satisfies readonly (keyof Mesh)[];

/** What `initMeshTransform` accepts. */
type MeshParts = Partial<Mesh> & { _flatNormal?: boolean };

/**
 * Makes a copy of `book` that sits `dx` units further along its shelf's own
 * x axis, and adds it to `scene`.
 *
 * The copy gets the same parent as the book. Its local transform is the
 * book's local transform moved by (dx, 0, 0) in the parent's space. So it has
 * the same size and turn, lies along the shelf however the shelf is placed,
 * and keeps following the shelf when the shelf is moved or turned later.
 * The book itself is not modified.
 */
export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh {
    if (!Number.isFinite(dx)) {
        throw new RangeError(`duplicateAlongShelf: dx must be a finite number, got ${dx}`);
    }
    if (book._disposed) {
        throw new Error(`duplicateAlongShelf: mesh "${book.name}" has been disposed`);
    }

    // 1. A new mesh with the book's appearance and its own transform state.
    //    (Spreading `book` would hand the copy the book's position, rotation
    //    and scaling objects, so moving the copy would move the book too.)
    const parts: MeshParts = { name: `${book.name} copy`, children: [] };
    for (const key of APPEARANCE_KEYS) copyField(parts, book, key);
    if (book.id !== undefined) parts.id = uniqueMeshId(scene, book.id);
    if (book.boundMin) parts.boundMin = vec3(book.boundMin);
    if (book.boundMax) parts.boundMax = vec3(book.boundMax);
    const flatNormal = (book as MeshParts)._flatNormal;
    if (flatNormal !== undefined) parts._flatNormal = flatNormal;

    const copy = initMeshTransform(parts);

    // The geometry buffers (and thin-instance data, if any) are now used by
    // two meshes. Count the extra user so that disposing one of them does
    // not free buffers the other still draws with.
    const gpu = copy._gpu;
    gpu._refCount = (gpu._refCount ?? 1) + 1;
    const thin = copy.thinInstances;
    if (thin) thin._refCount = (thin._refCount ?? 1) + 1;

    // 2. Put the copy on the same shelf.
    //    Parent first, local transform second. That order gives the right
    //    result whether setParent keeps the child's local transform or keeps
    //    its world transform (and so rewrites the local one).
    const shelf = book.parent;
    if (shelf) {
        setParent(copy, shelf);
        // If the shelf lists the book among its children, list the copy too.
        const siblings = (shelf as { children?: Mesh["children"] }).children;
        if (siblings?.includes(book) && !siblings.includes(copy)) siblings.push(copy);
    }

    // book.position is the book's place on the shelf, in the shelf's space.
    // Adding dx to its x moves along the shelf's x axis, wherever the shelf
    // is and however it is turned. Rotation and scaling are copied as they are.
    const p = book.position;
    const r = book.rotation;
    const s = book.scaling;
    if (copy._localMatrixLocked) copy._localMatrixLocked = false;
    copy.position.set(p.x + dx, p.y, p.z);
    copy.rotation.set(r.x, r.y, r.z);
    copy.scaling.set(s.x, s.y, s.z);

    // A book whose local matrix is locked (for example a node built from a
    // matrix) is placed by that matrix, not by position/rotation/scaling.
    // Copy the matrix and move its translation by dx along the parent's x
    // axis. Translation is at elements 12..14.
    if (book._localMatrixLocked && book._localMatrix) {
        const local = Float32Array.from(book._localMatrix as unknown as ArrayLike<number>);
        local[12] += dx;
        copy._localMatrix = local as unknown as NonNullable<Mesh["_localMatrix"]>;
        copy._localMatrixLocked = true;
    }

    // 3. Light the copy like the book. If a light includes or excludes the
    //    book by name (mesh or id), do the same for the copy, so it gets the
    //    same lighting and the same shadow-caster status. This is done before
    //    addToScene, so the copy's first build already sees these settings.
    for (const light of scene.lights) {
        let changed = false;
        const excluded = withCopy(light.excludedMeshes, book, copy);
        if (excluded) { light.excludedMeshes = excluded; changed = true; }
        const includedOnly = withCopy(light.includedOnlyMeshes, book, copy);
        if (includedOnly) { light.includedOnlyMeshes = includedOnly; changed = true; }
        const excludedIds = withCopy(light.excludedMeshIds, book.id, copy.id);
        if (excludedIds) { light.excludedMeshIds = excludedIds; changed = true; }
        const includedOnlyIds = withCopy(light.includedOnlyMeshIds, book.id, copy.id);
        if (includedOnlyIds) { light.includedOnlyMeshIds = includedOnlyIds; changed = true; }
        if (changed) light._bumpLightVersion?.();
    }

    // 4. Same visibility, then add it to the scene.
    if (book.visible === false) setMeshVisible(copy, false);
    addToScene(scene, copy);

    return copy;
}

function copyField<K extends keyof Mesh>(to: Partial<Mesh>, from: Mesh, key: K): void {
    const value = from[key];
    if (value !== undefined) to[key] = value;
}

function vec3(v: readonly [number, number, number]): [number, number, number] {
    return [v[0], v[1], v[2]];
}

/** Builds an id from the book's id that no mesh in the scene uses yet. */
function uniqueMeshId(scene: SceneContext, base: string): string {
    const taken = new Set(scene.meshes.map((m) => m.id));
    let id = `${base}-copy`;
    for (let n = 2; taken.has(id); n++) id = `${base}-copy-${n}`;
    return id;
}

/**
 * If `set` contains `original`, returns a new set that also contains `copy`.
 * Otherwise returns undefined. A new set is returned instead of changing the
 * old one, because the light only exposes these sets as ReadonlySet.
 */
function withCopy<T>(
    set: ReadonlySet<T> | undefined,
    original: T | undefined,
    copy: T | undefined,
): ReadonlySet<T> | undefined {
    if (!set || original === undefined || copy === undefined || !set.has(original)) return undefined;
    return new Set([...set, copy]);
}
