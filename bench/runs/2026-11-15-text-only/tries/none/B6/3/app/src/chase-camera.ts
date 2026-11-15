import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Squared length below which the car's up is treated as parallel to the line of sight.
const DEGENERATE_EPS_SQ = 1e-18;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalizeOrNull(v: Vec): Vec | null {
    const lenSq = dot(v, v);
    if (!(lenSq > DEGENERATE_EPS_SQ) || !Number.isFinite(lenSq)) return null;
    const len = Math.sqrt(lenSq);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Component of `up` perpendicular to unit `forward`, normalized.
 * Returns null when `up` is (numerically) parallel to `forward`.
 */
function projectOntoPlane(up: Vec, forward: Vec): Vec | null {
    const d = dot(up, forward);
    return normalizeOrNull({
        x: up.x - d * forward.x,
        y: up.y - d * forward.y,
        z: up.z - d * forward.z,
    });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalizeOrNull({ x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z });
    if (forward === null) throw new Error("createChaseCamera: eye and target must differ");

    // Upright start: world +Y projected onto the image plane, falling back to +Z
    // when the view is exactly vertical.
    const startUp =
        projectOntoPlane({ x: 0, y: 1, z: 0 }, forward) ??
        projectOntoPlane({ x: 0, y: 0, z: 1 }, forward);
    if (startUp === null) throw new Error("createChaseCamera: could not determine an upright roll");

    const camera = new FreeCamera("chase-camera");
    camera.position = { x: eye.x, y: eye.y, z: eye.z };
    camera.setTarget(target);
    camera.upVector = { x: startUp.x, y: startUp.y, z: startUp.z };

    return {
        camera,
        bank(up: Vec): void {
            const unitUp = normalizeOrNull(up);
            if (unitUp === null) return;
            const next = projectOntoPlane(unitUp, forward);
            // Up is along the line of sight: roll is undefined, so keep the previous roll.
            if (next === null) return;
            camera.upVector = { x: next.x, y: next.y, z: next.z };
        },
    };
}
