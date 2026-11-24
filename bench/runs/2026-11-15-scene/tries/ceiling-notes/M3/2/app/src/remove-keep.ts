import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

type SceneNode = Mesh["children"][number];
type Vec3 = [number, number, number];
type Quat = [number, number, number, number];

/**
 * A 4x4 affine transform in the layout of `worldMatrix`: the images of the x, y and z axes in
 * elements 0-2, 4-6 and 8-10, the translation in 12-14.
 */
type Matrix = number[];

interface LocalTransform {
    position: Vec3;
    rotationQuaternion: Quat;
    scaling: Vec3;
}

/**
 * Takes `mesh` out of `scene` but keeps what is attached directly to it.
 *
 * The meshes (and lights) of `scene` whose parent is `mesh` stay in the scene, listed as often as
 * before. They move to `mesh`'s own parent, or to no parent if it had none, with a local transform
 * that leaves them where they were in the world; their own children come with them.
 * Does nothing if `mesh` is not in `scene`.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
    const listed = scene.meshes.filter((m) => m === mesh).length;
    if (listed === 0) return;

    let target = mesh.parent;
    let worldToTarget: Matrix | null = null;
    if (target) {
        worldToTarget = invertAffine(Array.from(target.worldMatrix));
        // Nothing can be placed exactly under a parent scaled to zero; put the nodes at the root.
        if (!worldToTarget) target = null;
    }

    // Work everything out before changing anything, while the world matrices still hold.
    const moves = attachedSceneNodes(scene, mesh).map((node) => {
        const world = Array.from(node.worldMatrix);
        const local = worldToTarget ? multiply(worldToTarget, world) : world;
        const currentScaling: Vec3 = [node.scaling.x, node.scaling.y, node.scaling.z];
        return { node, transform: decompose(local, currentScaling) };
    });

    for (const { node, transform } of moves) {
        // setParent, not `node.parent = ...`: removeFromScene(mesh) walks mesh.children and would
        // take out (and dispose) anything still listed there (scene-notes.md 2, 13). The kept nodes
        // never leave the scene, so they are not added again; addToScene would list them twice (21).
        setParent(node, target);
        // Written after setParent, so it does not matter whether setParent keeps the world or the
        // local transform. The quaternion rather than the Euler `rotation`, whose order is not
        // Babylon.js's (9).
        applyTransform(node, transform);
    }

    // removeFromScene leaves a mesh in its parent's children, where a later addToScene(parent)
    // would find it again (scene-notes.md 14).
    if (mesh.parent) setParent(mesh, null);
    for (let i = 0; i < listed; i++) removeFromScene(scene, mesh);
}

/** The meshes and lights of `scene` attached directly to `mesh`, in `mesh.children` order first. */
function attachedSceneNodes(scene: SceneContext, mesh: Mesh): SceneNode[] {
    const members = new Set<SceneNode>([...scene.meshes, ...scene.lights]);
    const attached = new Set<SceneNode>();
    // A child that already left the scene can still be in mesh.children (scene-notes.md 14); it is
    // not kept, and goes with `mesh`.
    for (const child of mesh.children) if (members.has(child)) attached.add(child);
    // A node whose `parent` was assigned directly is missing from mesh.children (scene-notes.md 2).
    for (const node of members) if (node.parent === mesh) attached.add(node);
    attached.delete(mesh);
    return [...attached];
}

function applyTransform(node: SceneNode, t: LocalTransform): void {
    node.position.x = t.position[0];
    node.position.y = t.position[1];
    node.position.z = t.position[2];
    node.rotationQuaternion.x = t.rotationQuaternion[0];
    node.rotationQuaternion.y = t.rotationQuaternion[1];
    node.rotationQuaternion.z = t.rotationQuaternion[2];
    node.rotationQuaternion.w = t.rotationQuaternion[3];
    node.scaling.x = t.scaling[0];
    node.scaling.y = t.scaling[1];
    node.scaling.z = t.scaling[2];
}

/**
 * Splits an affine matrix into position, rotation and scaling. A matrix with skew (a rotated child
 * of a non-uniformly scaled parent) has no exact split; the rotation is then an approximation.
 */
function decompose(m: Matrix, currentScaling: Vec3): LocalTransform {
    const axes: [Vec3, Vec3, Vec3] = [
        [m[0], m[1], m[2]],
        [m[4], m[5], m[6]],
        [m[8], m[9], m[10]],
    ];
    const scaling: Vec3 = [Math.hypot(...axes[0]), Math.hypot(...axes[1]), Math.hypot(...axes[2])];
    if (dot(axes[0], cross(axes[1], axes[2])) < 0) {
        // Mirrored, so one factor must be negative. Put the sign on an axis the node already had
        // mirrored, so that its numbers change as little as possible.
        const axis = Math.max(0, currentScaling.findIndex((s) => s < 0));
        scaling[axis] = -scaling[axis];
    }
    const rotationQuaternion: Quat = scaling.every((s) => s !== 0)
        ? quaternionFromAxes([
              scale(axes[0], 1 / scaling[0]),
              scale(axes[1], 1 / scaling[1]),
              scale(axes[2], 1 / scaling[2]),
          ])
        : [0, 0, 0, 1];
    return { position: [m[12], m[13], m[14]], rotationQuaternion, scaling };
}

/** The unit quaternion (x, y, z, w) of the rotation taking the x, y and z axes to `x`, `y`, `z`. */
function quaternionFromAxes([x, y, z]: [Vec3, Vec3, Vec3]): Quat {
    // Rotation matrix entries rRC, row R, column C; column C is the image of axis C.
    const [r00, r10, r20] = x;
    const [r01, r11, r21] = y;
    const [r02, r12, r22] = z;
    const trace = r00 + r11 + r22;
    let q: Quat;
    if (trace > 0) {
        const s = 2 * Math.sqrt(trace + 1);
        q = [(r21 - r12) / s, (r02 - r20) / s, (r10 - r01) / s, s / 4];
    } else if (r00 > r11 && r00 > r22) {
        const s = 2 * Math.sqrt(1 + r00 - r11 - r22);
        q = [s / 4, (r01 + r10) / s, (r02 + r20) / s, (r21 - r12) / s];
    } else if (r11 > r22) {
        const s = 2 * Math.sqrt(1 + r11 - r00 - r22);
        q = [(r01 + r10) / s, s / 4, (r12 + r21) / s, (r02 - r20) / s];
    } else {
        const s = 2 * Math.sqrt(1 + r22 - r00 - r11);
        q = [(r02 + r20) / s, (r12 + r21) / s, s / 4, (r10 - r01) / s];
    }
    const n = Math.hypot(...q);
    return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

/** The inverse of an affine matrix, or null if it has none. */
function invertAffine(m: Matrix): Matrix | null {
    const x: Vec3 = [m[0], m[1], m[2]];
    const y: Vec3 = [m[4], m[5], m[6]];
    const z: Vec3 = [m[8], m[9], m[10]];
    const t: Vec3 = [m[12], m[13], m[14]];
    const det = dot(x, cross(y, z));
    if (det === 0 || !Number.isFinite(det)) return null;
    // The rows of the inverse of the 3x3 part.
    const rows = [cross(y, z), cross(z, x), cross(x, y)].map((r) => scale(r, 1 / det));
    const out = new Array<number>(16).fill(0);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) out[c * 4 + r] = rows[r][c];
        out[12 + r] = -dot(rows[r], t);
    }
    out[15] = 1;
    return out;
}

/** a · b: the transform that applies b first, then a. */
function multiply(a: Matrix, b: Matrix): Matrix {
    const out = new Array<number>(16);
    for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
            out[c * 4 + r] = sum;
        }
    }
    return out;
}

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function scale(a: Vec3, s: number): Vec3 {
    return [a[0] * s, a[1] * s, a[2] * s];
}
