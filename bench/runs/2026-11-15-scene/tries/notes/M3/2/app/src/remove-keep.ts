import { removeFromScene, setParent } from "@babylonjs/lite";
import type { Mesh, SceneContext } from "@babylonjs/lite";

type Transformable = Pick<Mesh, "position" | "rotationQuaternion" | "scaling">;

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene,
 * at the same world placement, and no longer attached to `mesh`.
 *
 * Order matters:
 *  - each child's world matrix is captured first, while it is still attached;
 *  - each child is detached with setParent(child, null) before the mesh is removed,
 *    because removeFromScene(mesh) would otherwise also remove and dispose every
 *    descendant reached through `children`;
 *  - the captured world matrix is written back as the child's own TRS, since it
 *    has no parent after detaching.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const kept = mesh.children.map((child) => ({
        child,
        world: Array.from(child.worldMatrix),
    }));

    for (const { child, world } of kept) {
        setParent(child, null);
        writeWorldAsTrs(child, world);
    }

    removeFromScene(scene, mesh);
}

/**
 * Writes a column-major affine world matrix (translation in elements 12..14)
 * into a node's position, rotationQuaternion and scaling.
 * Assumes no shear; a negative determinant is stored as a negative x scale.
 */
function writeWorldAsTrs(node: Transformable, m: ArrayLike<number>): void {
    let sx = Math.hypot(m[0], m[1], m[2]);
    const sy = Math.hypot(m[4], m[5], m[6]);
    const sz = Math.hypot(m[8], m[9], m[10]);

    const det =
        m[0] * (m[5] * m[10] - m[6] * m[9]) -
        m[4] * (m[1] * m[10] - m[2] * m[9]) +
        m[8] * (m[1] * m[6] - m[2] * m[5]);
    if (det < 0) {
        sx = -sx;
    }

    const ix = sx !== 0 ? 1 / sx : 0;
    const iy = sy !== 0 ? 1 / sy : 0;
    const iz = sz !== 0 ? 1 / sz : 0;

    // Rotation matrix R[row][col]; column j is the normalized image of axis j.
    const r00 = m[0] * ix, r01 = m[4] * iy, r02 = m[8] * iz;
    const r10 = m[1] * ix, r11 = m[5] * iy, r12 = m[9] * iz;
    const r20 = m[2] * ix, r21 = m[6] * iy, r22 = m[10] * iz;

    // Rotation matrix to quaternion (Shepperd's method).
    const trace = r00 + r11 + r22;
    let qx: number, qy: number, qz: number, qw: number;
    if (trace > 0) {
        const s = Math.sqrt(trace + 1) * 2;
        qw = 0.25 * s;
        qx = (r21 - r12) / s;
        qy = (r02 - r20) / s;
        qz = (r10 - r01) / s;
    } else if (r00 > r11 && r00 > r22) {
        const s = Math.sqrt(1 + r00 - r11 - r22) * 2;
        qw = (r21 - r12) / s;
        qx = 0.25 * s;
        qy = (r01 + r10) / s;
        qz = (r02 + r20) / s;
    } else if (r11 > r22) {
        const s = Math.sqrt(1 + r11 - r00 - r22) * 2;
        qw = (r02 - r20) / s;
        qx = (r01 + r10) / s;
        qy = 0.25 * s;
        qz = (r12 + r21) / s;
    } else {
        const s = Math.sqrt(1 + r22 - r00 - r11) * 2;
        qw = (r10 - r01) / s;
        qx = (r02 + r20) / s;
        qy = (r12 + r21) / s;
        qz = 0.25 * s;
    }

    node.position.x = m[12];
    node.position.y = m[13];
    node.position.z = m[14];
    node.rotationQuaternion.x = qx;
    node.rotationQuaternion.y = qy;
    node.rotationQuaternion.z = qz;
    node.rotationQuaternion.w = qw;
    node.scaling.x = sx;
    node.scaling.y = sy;
    node.scaling.z = sz;
}
