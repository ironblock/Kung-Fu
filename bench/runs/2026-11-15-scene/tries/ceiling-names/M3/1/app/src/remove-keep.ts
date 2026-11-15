import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Removes `mesh` from `scene` but keeps the meshes attached directly to it.
 *
 * Each kept mesh is re-attached to the removed mesh's own parent (no parent when it had none),
 * keeps its world placement, and stays in `scene.meshes` exactly once.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const sceneMeshes = new Set<object>(scene.meshes);
    // A copy, because setParent changes mesh.children while we loop.
    const kept = mesh.children.filter((child): child is Mesh => sceneMeshes.has(child));
    const newParent = mesh.parent;

    for (const child of kept) {
        const world = Array.from(child.worldMatrix);
        setParent(child, newParent);
        // In case setParent does not keep the world placement itself, put the mesh back.
        if (!sameMatrix(child.worldMatrix, world)) {
            const local = newParent ? relativeTo(newParent.worldMatrix, world) : world;
            if (local) setTransformFromMatrix(child, local);
        }
    }

    // Detach first, then remove: removing a mesh may also remove what is attached to it,
    // and the kept meshes are no longer attached.
    removeFromScene(scene, mesh);

    // Should the removal have taken a kept mesh anyway, add it back, once.
    for (const child of kept) {
        if (!scene.meshes.includes(child)) addToScene(scene, child);
    }
}

// Matrices are 16 numbers, one basis axis per group of four, translation in elements 12-14
// (memory index = column * 4 + row for column vectors).

function sameMatrix(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
    for (let col = 0; col < 4; col++) {
        let scale = 1;
        for (let row = 0; row < 4; row++) scale = Math.max(scale, Math.abs(b[col * 4 + row]));
        for (let row = 0; row < 4; row++) {
            const i = col * 4 + row;
            if (!(Math.abs(a[i] - b[i]) <= 1e-5 * scale)) return false;
        }
    }
    return true;
}

/** The local matrix that places a node at `world` under a parent at `parentWorld`; null if the parent is degenerate. */
function relativeTo(parentWorld: ArrayLike<number>, world: ArrayLike<number>): number[] | null {
    const inverse = invertAffine(parentWorld);
    if (!inverse) return null;
    const out = new Array<number>(16);
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) sum += inverse[k * 4 + row] * world[col * 4 + k];
            out[col * 4 + row] = sum;
        }
    }
    return out;
}

function invertAffine(m: ArrayLike<number>): number[] | null {
    const c0 = [m[0], m[1], m[2]];
    const c1 = [m[4], m[5], m[6]];
    const c2 = [m[8], m[9], m[10]];
    // The rows of the inverse 3x3 are (c1 x c2, c2 x c0, c0 x c1) / det.
    const rows = [cross(c1, c2), cross(c2, c0), cross(c0, c1)];
    const det = dot(c0, rows[0]);
    if (det === 0) return null;
    const t = [m[12], m[13], m[14]];
    const out = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) out[col * 4 + row] = rows[row][col] / det;
        out[12 + row] = -dot(rows[row], t) / det;
    }
    return out;
}

/** Sets position, rotation and scaling so that the node's local matrix is `m` (exact unless `m` has shear). */
function setTransformFromMatrix(node: Mesh, m: ArrayLike<number>): void {
    let sx = Math.hypot(m[0], m[1], m[2]);
    const sy = Math.hypot(m[4], m[5], m[6]);
    const sz = Math.hypot(m[8], m[9], m[10]);
    // A mirrored placement (negative determinant) becomes a negative x scale.
    if (dot([m[0], m[1], m[2]], cross([m[4], m[5], m[6]], [m[8], m[9], m[10]])) < 0) sx = -sx;
    const ix = sx === 0 ? 0 : 1 / sx;
    const iy = sy === 0 ? 0 : 1 / sy;
    const iz = sz === 0 ? 0 : 1 / sz;

    // Rotation matrix, rRC = row R, column C.
    const r00 = m[0] * ix, r10 = m[1] * ix, r20 = m[2] * ix;
    const r01 = m[4] * iy, r11 = m[5] * iy, r21 = m[6] * iy;
    const r02 = m[8] * iz, r12 = m[9] * iz, r22 = m[10] * iz;

    let x: number, y: number, z: number, w: number;
    const trace = r00 + r11 + r22;
    if (trace > 0) {
        const s = 2 * Math.sqrt(trace + 1);
        w = s / 4; x = (r21 - r12) / s; y = (r02 - r20) / s; z = (r10 - r01) / s;
    } else if (r00 > r11 && r00 > r22) {
        const s = 2 * Math.sqrt(1 + r00 - r11 - r22);
        w = (r21 - r12) / s; x = s / 4; y = (r01 + r10) / s; z = (r02 + r20) / s;
    } else if (r11 > r22) {
        const s = 2 * Math.sqrt(1 + r11 - r00 - r22);
        w = (r02 - r20) / s; x = (r01 + r10) / s; y = s / 4; z = (r12 + r21) / s;
    } else {
        const s = 2 * Math.sqrt(1 + r22 - r00 - r11);
        w = (r10 - r01) / s; x = (r02 + r20) / s; y = (r12 + r21) / s; z = s / 4;
    }
    const n = Math.hypot(x, y, z, w);

    node.position.x = m[12];
    node.position.y = m[13];
    node.position.z = m[14];
    node.rotationQuaternion.x = x / n;
    node.rotationQuaternion.y = y / n;
    node.rotationQuaternion.z = z / n;
    node.rotationQuaternion.w = w / n;
    node.scaling.x = sx;
    node.scaling.y = sy;
    node.scaling.z = sz;
}

function cross(a: number[], b: number[]): number[] {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
