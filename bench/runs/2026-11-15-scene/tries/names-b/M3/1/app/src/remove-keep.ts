import type { Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, removeFromScene, setParent } from "@babylonjs/lite";

type Child = Mesh["children"][number];
type Vec3T = [number, number, number];

function isMesh(node: Child): node is Mesh {
    return (node as Partial<Mesh>)._gpu !== undefined;
}

function cross(a: Vec3T, b: Vec3T): Vec3T {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3T, b: Vec3T): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function length(v: Vec3T): number {
    return Math.hypot(v[0], v[1], v[2]);
}

/**
 * Decomposes a world matrix (row-vector layout: translation in elements 12..14,
 * basis vector j in elements 4j..4j+2) into position, rotation quaternion (x, y, z, w)
 * and scale. Shear is discarded.
 */
function worldToTrs(m: ArrayLike<number>): { p: Vec3T; q: [number, number, number, number]; s: Vec3T } {
    const c0: Vec3T = [m[0], m[1], m[2]];
    const c1: Vec3T = [m[4], m[5], m[6]];
    const c2: Vec3T = [m[8], m[9], m[10]];

    // A negative determinant means the matrix mirrors; carry that sign on the X scale.
    const flip = dot(c0, cross(c1, c2)) < 0 ? -1 : 1;
    const sx = flip * length(c0);
    const sy = length(c1);
    const sz = length(c2);

    const div = (v: Vec3T, s: number): Vec3T => (s === 0 ? [0, 0, 0] : [v[0] / s, v[1] / s, v[2] / s]);
    const col0 = div(c0, sx);
    const col1 = div(c1, sy);
    const col2 = div(c2, sz);

    // R[i][j] = column j, row i.
    const r00 = col0[0], r01 = col1[0], r02 = col2[0];
    const r10 = col0[1], r11 = col1[1], r12 = col2[1];
    const r20 = col0[2], r21 = col1[2], r22 = col2[2];

    const trace = r00 + r11 + r22;
    let x: number, y: number, z: number, w: number;
    if (trace > 0) {
        const s = Math.sqrt(trace + 1) * 2;
        w = 0.25 * s;
        x = (r21 - r12) / s;
        y = (r02 - r20) / s;
        z = (r10 - r01) / s;
    } else if (r00 > r11 && r00 > r22) {
        const s = Math.sqrt(1 + r00 - r11 - r22) * 2;
        w = (r21 - r12) / s;
        x = 0.25 * s;
        y = (r01 + r10) / s;
        z = (r02 + r20) / s;
    } else if (r11 > r22) {
        const s = Math.sqrt(1 + r11 - r00 - r22) * 2;
        w = (r02 - r20) / s;
        x = (r01 + r10) / s;
        y = 0.25 * s;
        z = (r12 + r21) / s;
    } else {
        const s = Math.sqrt(1 + r22 - r00 - r11) * 2;
        w = (r10 - r01) / s;
        x = (r02 + r20) / s;
        y = (r12 + r21) / s;
        z = 0.25 * s;
    }

    return { p: [m[12], m[13], m[14]], q: [x, y, z, w], s: [sx, sy, sz] };
}

/**
 * Removes `mesh` from the scene. Its direct mesh children stay in the scene at the
 * same world placement, detached from `mesh`, and each appears in `scene.meshes` once.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const kept = mesh.children.filter(isMesh);

    // Capture world placement before touching any parent link.
    const worlds = kept.map((child) => Array.from(child.worldMatrix as ArrayLike<number>));

    // Detach first, so removing `mesh` cannot take the children with it.
    kept.forEach((child, i) => {
        setParent(child, null);
        // Write the world placement back as local values, since the child no longer
        // inherits from `mesh`. This is correct whether or not setParent preserves it.
        const t = worldToTrs(worlds[i]);
        child.position.set(t.p[0], t.p[1], t.p[2]);
        child.rotationQuaternion.set(t.q[0], t.q[1], t.q[2], t.q[3]);
        child.scaling.set(t.s[0], t.s[1], t.s[2]);
    });

    // Make sure no stale link to a kept child remains on `mesh`.
    for (let i = mesh.children.length - 1; i >= 0; i--) {
        if (kept.includes(mesh.children[i] as Mesh)) {
            mesh.children.splice(i, 1);
        }
    }

    removeFromScene(scene, mesh);

    // Fallback: only if a kept child is no longer in the scene, add it back once.
    for (const child of kept) {
        if (!scene.meshes.includes(child)) {
            addToScene(scene, child);
        }
    }
}
