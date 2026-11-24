import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

type Child = Mesh["children"][number];

interface Trs {
    t: [number, number, number];
    q: [number, number, number, number];
    s: [number, number, number];
}

/**
 * Decompose a Babylon-style world matrix (translation in elements 12..14,
 * basis vectors in rows 0..2) into translation, rotation quaternion and scale.
 * Shear cannot be represented in TRS and is dropped.
 */
function decomposeWorldMatrix(m: ArrayLike<number>): Trs {
    const tx = m[12], ty = m[13], tz = m[14];

    let sx = Math.hypot(m[0], m[1], m[2]);
    const sy = Math.hypot(m[4], m[5], m[6]);
    const sz = Math.hypot(m[8], m[9], m[10]);

    // Negative determinant means the basis is mirrored; carry that sign on X.
    const det =
        m[0] * (m[5] * m[10] - m[9] * m[6]) -
        m[4] * (m[1] * m[10] - m[9] * m[2]) +
        m[8] * (m[1] * m[6] - m[5] * m[2]);
    if (det < 0) sx = -sx;

    // Rotation matrix R[row][col]: columns are the normalized basis vectors.
    const r00 = m[0] / sx, r10 = m[1] / sx, r20 = m[2] / sx;
    const r01 = m[4] / sy, r11 = m[5] / sy, r21 = m[6] / sy;
    const r02 = m[8] / sz, r12 = m[9] / sz, r22 = m[10] / sz;

    let x: number, y: number, z: number, w: number;
    const trace = r00 + r11 + r22;
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

    return { t: [tx, ty, tz], q: [x, y, z, w], s: [sx, sy, sz] };
}

function applyLocalTrs(node: Child, trs: Trs): void {
    node.position.x = trs.t[0];
    node.position.y = trs.t[1];
    node.position.z = trs.t[2];
    node.rotationQuaternion.x = trs.q[0];
    node.rotationQuaternion.y = trs.q[1];
    node.rotationQuaternion.z = trs.q[2];
    node.rotationQuaternion.w = trs.q[3];
    node.scaling.x = trs.s[0];
    node.scaling.y = trs.s[1];
    node.scaling.z = trs.s[2];
}

/**
 * Removes `mesh` from the scene. Its direct children stay in the scene at the
 * same world placement, detached from `mesh`. They are not re-added to the
 * scene: they already hold their single entry in `scene.meshes`.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Snapshot first: setParent mutates the children array.
    const children: Child[] = [...mesh.children];

    // Capture world transforms before anything is detached.
    const worlds = children.map((child) => ({
        child,
        trs: decomposeWorldMatrix(child.worldMatrix),
    }));

    // Detach every child before removing the parent, so the removal cannot
    // take the children along with it.
    for (const { child, trs } of worlds) {
        setParent(child, null);
        // The local transform was relative to the parent; with no parent it
        // must equal the old world transform.
        applyLocalTrs(child, trs);
    }

    removeFromScene(scene, mesh);
}
