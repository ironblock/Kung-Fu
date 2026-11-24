import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

// ASSUMPTION (not verified: the library is not available here): world matrices
// use Babylon's layout, with translation in elements 12..14 and the X/Y/Z axes
// in rows 0..2, 4..6 and 8..10.
interface Decomposed {
    translation: [number, number, number];
    rotation: [number, number, number, number]; // x, y, z, w
    scaling: [number, number, number];
}

function decomposeWorld(m: ArrayLike<number>): Decomposed {
    const sx = Math.hypot(m[0], m[1], m[2]);
    const sy = Math.hypot(m[4], m[5], m[6]);
    const sz = Math.hypot(m[8], m[9], m[10]);

    // Unit axes (rows of the rotation part). Guard against zero scale.
    const ix = sx || 1, iy = sy || 1, iz = sz || 1;
    const X = [m[0] / ix, m[1] / ix, m[2] / ix];
    const Y = [m[4] / iy, m[5] / iy, m[6] / iy];
    const Z = [m[8] / iz, m[9] / iz, m[10] / iz];

    // Rotation matrix R acting on column vectors: R[i][j] = axis_j[i].
    const R00 = X[0], R01 = Y[0], R02 = Z[0];
    const R10 = X[1], R11 = Y[1], R12 = Z[1];
    const R20 = X[2], R21 = Y[2], R22 = Z[2];

    let x: number, y: number, z: number, w: number;
    const trace = R00 + R11 + R22;
    if (trace > 0) {
        const s = 2 * Math.sqrt(trace + 1);
        w = 0.25 * s;
        x = (R21 - R12) / s;
        y = (R02 - R20) / s;
        z = (R10 - R01) / s;
    } else if (R00 > R11 && R00 > R22) {
        const s = 2 * Math.sqrt(1 + R00 - R11 - R22);
        w = (R21 - R12) / s;
        x = 0.25 * s;
        y = (R01 + R10) / s;
        z = (R02 + R20) / s;
    } else if (R11 > R22) {
        const s = 2 * Math.sqrt(1 + R11 - R00 - R22);
        w = (R02 - R20) / s;
        x = (R01 + R10) / s;
        y = 0.25 * s;
        z = (R12 + R21) / s;
    } else {
        const s = 2 * Math.sqrt(1 + R22 - R00 - R11);
        w = (R10 - R01) / s;
        x = (R02 + R20) / s;
        y = (R12 + R21) / s;
        z = 0.25 * s;
    }

    return {
        translation: [m[12], m[13], m[14]],
        rotation: [x, y, z, w],
        scaling: [sx, sy, sz],
    };
}

/**
 * Removes `mesh` from the scene while keeping its direct mesh children in the
 * scene, at the same world placement, detached from `mesh`.
 *
 * Children are detached before `mesh` is removed, so the removal does not
 * depend on how it treats the subtree. Each kept child is still in
 * `scene.meshes` exactly once, because nothing is added again.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    // Only mesh children are kept; `children` is a copy, so detaching while
    // iterating is safe.
    const kept = mesh.children.filter((c) => scene.meshes.includes(c as Mesh)) as Mesh[];

    // Capture world placement before any change to the hierarchy.
    const worlds = kept.map((child) => Array.from(child.worldMatrix as ArrayLike<number>));

    for (let i = 0; i < kept.length; i++) {
        const child = kept[i];
        setParent(child, null);

        // With no parent, local transform equals world transform.
        const d = decomposeWorld(worlds[i]);
        child.position.x = d.translation[0];
        child.position.y = d.translation[1];
        child.position.z = d.translation[2];
        child.rotationQuaternion.x = d.rotation[0];
        child.rotationQuaternion.y = d.rotation[1];
        child.rotationQuaternion.z = d.rotation[2];
        child.rotationQuaternion.w = d.rotation[3];
        child.scaling.x = d.scaling[0];
        child.scaling.y = d.scaling[1];
        child.scaling.z = d.scaling[2];
    }

    removeFromScene(scene, mesh);
}
