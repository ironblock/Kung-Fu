import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

type Child = Mesh["children"][number];

interface Trs {
    t: [number, number, number];
    q: [number, number, number, number]; // x, y, z, w
    s: [number, number, number];
}

/**
 * Splits a Babylon-style world matrix (row-vector convention, translation in
 * elements 12..14, basis axis c stored in elements 4c..4c+2) into translation,
 * rotation quaternion and scale. Exact for matrices without shear.
 */
function decomposeWorld(m: ArrayLike<number>): Trs {
    const t: [number, number, number] = [m[12], m[13], m[14]];

    const s = [
        Math.hypot(m[0], m[1], m[2]),
        Math.hypot(m[4], m[5], m[6]),
        Math.hypot(m[8], m[9], m[10]),
    ];
    // Negative determinant means a mirrored transform; carry the sign on X.
    const det =
        m[0] * (m[5] * m[10] - m[6] * m[9]) -
        m[1] * (m[4] * m[10] - m[6] * m[8]) +
        m[2] * (m[4] * m[9] - m[5] * m[8]);
    if (det < 0) s[0] = -s[0];

    if (s.some((v) => Math.abs(v) < 1e-12)) {
        return { t, q: [0, 0, 0, 1], s: [s[0], s[1], s[2]] };
    }

    // Normalised rotation in column-vector form: R[i][j] = m[4j + i] / s[j].
    const R = (i: number, j: number) => m[4 * j + i] / s[j];
    const r00 = R(0, 0), r01 = R(0, 1), r02 = R(0, 2);
    const r10 = R(1, 0), r11 = R(1, 1), r12 = R(1, 2);
    const r20 = R(2, 0), r21 = R(2, 1), r22 = R(2, 2);

    const trace = r00 + r11 + r22;
    let x: number, y: number, z: number, w: number;
    if (trace > 0) {
        const S = Math.sqrt(trace + 1) * 2;
        w = S / 4;
        x = (r21 - r12) / S;
        y = (r02 - r20) / S;
        z = (r10 - r01) / S;
    } else if (r00 > r11 && r00 > r22) {
        const S = Math.sqrt(1 + r00 - r11 - r22) * 2;
        w = (r21 - r12) / S;
        x = S / 4;
        y = (r01 + r10) / S;
        z = (r02 + r20) / S;
    } else if (r11 > r22) {
        const S = Math.sqrt(1 + r11 - r00 - r22) * 2;
        w = (r02 - r20) / S;
        x = (r01 + r10) / S;
        y = S / 4;
        z = (r12 + r21) / S;
    } else {
        const S = Math.sqrt(1 + r22 - r00 - r11) * 2;
        w = (r10 - r01) / S;
        x = (r02 + r20) / S;
        y = (r12 + r21) / S;
        z = S / 4;
    }

    return { t, q: [x, y, z, w], s: [s[0], s[1], s[2]] };
}

/**
 * Removes `mesh` from the scene while keeping its direct children in the scene,
 * at the same world placement. Each child is unparented from `mesh` before the
 * removal, so the removal cannot take the children with it.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Copy first: unparenting mutates mesh.children.
    const kids: Child[] = [...mesh.children];

    for (const child of kids) {
        // Capture the world transform while the child is still attached.
        const world = decomposeWorld(child.worldMatrix);

        setParent(child, null);

        // Parent is now null, so local transform equals world transform.
        child.position.set(world.t[0], world.t[1], world.t[2]);
        child.rotationQuaternion.set(world.q[0], world.q[1], world.q[2], world.q[3]);
        child.scaling.set(world.s[0], world.s[1], world.s[2]);
    }

    // Children are already in scene.meshes from the loader; they are not
    // re-added here, so each stays in the list exactly once.
    removeFromScene(scene, mesh);
}
