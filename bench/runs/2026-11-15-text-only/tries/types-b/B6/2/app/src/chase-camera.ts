import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

/** Below this length the requested up is treated as parallel to the line of sight. */
const DEGENERATE_EPSILON = 1e-6;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function scale(a: Vec, s: number): Vec {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function isFiniteVec(a: Vec): boolean {
    return Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z);
}

/**
 * Projects `up` onto the plane perpendicular to the unit `forward` and normalizes it.
 * This is the direction closest to `up` that can appear as picture-up.
 * Returns null when `up` is (numerically) parallel to `forward` or not finite.
 */
function uprightComponent(up: Vec, forward: Vec): Vec | null {
    if (!isFiniteVec(up)) return null;
    const projected = sub(up, scale(forward, dot(up, forward)));
    const len = length(projected);
    if (!(len > DEGENERATE_EPSILON)) return null;
    return scale(projected, 1 / len);
}

/**
 * Creates a camera at `eye` looking at `target`, starting upright. Each `bank(up)` call
 * rolls the camera so its picture-up is the closest direction to `up` that is still
 * perpendicular to the line of sight. When `up` is parallel to the line of sight, the
 * camera keeps its previous roll.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const toTarget = sub(target, eye);
    const distance = length(toTarget);
    if (!(distance > 0) || !isFiniteVec(toTarget)) {
        throw new Error("createChaseCamera: eye and target must be distinct finite points");
    }
    const forward = scale(toTarget, 1 / distance);

    // Initial upright: world +Y, falling back to +Z then +X if the view is vertical.
    let upright: Vec | null = null;
    for (const worldUp of [{ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 }]) {
        upright = uprightComponent(worldUp, forward);
        if (upright) break;
    }
    if (!upright) {
        throw new Error("createChaseCamera: could not derive an initial up vector");
    }

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: upright.x, y: upright.y, z: upright.z },
    );

    // The camera never moves, so the line of sight is fixed. The roll lives entirely in
    // camera.upVector, which is left untouched on degenerate calls. That keeps the previous roll.
    return {
        camera,
        bank(up: Vec): void {
            const next = uprightComponent(up, forward);
            if (!next) return;
            camera.upVector.x = next.x;
            camera.upVector.y = next.y;
            camera.upVector.z = next.z;
        },
    };
}
