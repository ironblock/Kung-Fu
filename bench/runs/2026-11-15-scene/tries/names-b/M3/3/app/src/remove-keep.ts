import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

type Child = Mesh["children"][number];

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene,
 * at the same world placement, detached from `mesh`.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const children: Child[] = mesh.children.slice();

    // Capture world placement and scene membership while the children are still parented.
    const worlds = children.map((child) => Array.from(child.worldMatrix as ArrayLike<number>));
    const inScene = new Set<unknown>(scene.meshes);

    // Detach each child first, so removing `mesh` cannot take its children with it.
    // Local TRS is then set to the captured world transform, since the child is now a root.
    children.forEach((child, i) => {
        setParent(child, null);
        if (child.parent !== null) {
            throw new Error("removeKeepingAttached: child could not be detached from its parent");
        }
        applyWorldMatrix(child, worlds[i]);
    });

    removeFromScene(scene, mesh);

    // Each kept mesh must appear in scene.meshes exactly once.
    for (const child of children) {
        if (!inScene.has(child)) continue;
        const m = child as Mesh;
        const first = scene.meshes.indexOf(m);
        if (first === -1) {
            addToScene(scene, m);
            continue;
        }
        for (let i = scene.meshes.length - 1; i > first; i--) {
            if (scene.meshes[i] === m) scene.meshes.splice(i, 1);
        }
    }
}

/**
 * Writes position, rotation and scale into `node` so that, as a root node, it has
 * the given column-of-basis world matrix. Assumes Babylon's layout: basis axes in
 * rows 0-2, 4-6, 8-10 and translation in 12-14. Shear is not representable and is dropped.
 */
function applyWorldMatrix(node: Child, m: ArrayLike<number>): void {
    const t = [m[12], m[13], m[14]];
    const axes = [
        [m[0], m[1], m[2]],
        [m[4], m[5], m[6]],
        [m[8], m[9], m[10]],
    ];
    const lengths = axes.map(len);
    const unit = axes.map((a, i) => (lengths[i] === 0 ? [i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0] : a.map((v) => v / lengths[i])));

    const [ux, uy, uz] = unit;
    const negative = dot(ux, cross(uy, uz)) < 0;

    // Keep the rotation proper; a mirrored basis is carried by a negative x scale.
    const sx = negative ? -lengths[0] : lengths[0];
    const rx = negative ? ux.map((v) => -v) : ux;
    const ry = uy;
    const rz = uz;

    // Column-vector rotation matrix whose columns are the rotated basis axes.
    const r = [
        [rx[0], ry[0], rz[0]],
        [rx[1], ry[1], rz[1]],
        [rx[2], ry[2], rz[2]],
    ];
    const q = quatFromMatrix(r);

    node.position.set(t[0], t[1], t[2]);
    node.rotationQuaternion.set(q[0], q[1], q[2], q[3]);
    node.scaling.set(sx, lengths[1], lengths[2]);
}

function len(v: number[]): number {
    return Math.hypot(v[0], v[1], v[2]);
}

function dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: number[], b: number[]): number[] {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** Returns [x, y, z, w] for a proper rotation matrix r[row][col]. */
function quatFromMatrix(r: number[][]): [number, number, number, number] {
    const trace = r[0][0] + r[1][1] + r[2][2];
    if (trace > 0) {
        const s = Math.sqrt(trace + 1) * 2;
        return [(r[2][1] - r[1][2]) / s, (r[0][2] - r[2][0]) / s, (r[1][0] - r[0][1]) / s, 0.25 * s];
    }
    if (r[0][0] > r[1][1] && r[0][0] > r[2][2]) {
        const s = Math.sqrt(1 + r[0][0] - r[1][1] - r[2][2]) * 2;
        return [0.25 * s, (r[0][1] + r[1][0]) / s, (r[0][2] + r[2][0]) / s, (r[2][1] - r[1][2]) / s];
    }
    if (r[1][1] > r[2][2]) {
        const s = Math.sqrt(1 + r[1][1] - r[0][0] - r[2][2]) * 2;
        return [(r[0][1] + r[1][0]) / s, 0.25 * s, (r[1][2] + r[2][1]) / s, (r[0][2] - r[2][0]) / s];
    }
    const s = Math.sqrt(1 + r[2][2] - r[0][0] - r[1][1]) * 2;
    return [(r[0][2] + r[2][0]) / s, (r[1][2] + r[2][1]) / s, 0.25 * s, (r[1][0] - r[0][1]) / s];
}
