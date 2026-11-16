import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Relative threshold: if the projected up is shorter than this fraction of the
// input length, the input is treated as parallel to the line of sight.
const DEGENERATE_EPS = 1e-6;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.sqrt(dot(v, v));
}

function normalizeOrNull(v: Vec): Vec | null {
    const len = length(v);
    if (!(len > 0) || !Number.isFinite(len)) return null;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Projects `v` onto the plane perpendicular to the unit view direction `forward`
 * and normalizes the result. This is the up vector, within the plane perpendicular
 * to the line of sight, that is closest to `v`. Returns null when `v` is parallel
 * (or nearly parallel) to `forward`, or is zero, so no roll can be derived.
 */
function uprightFor(v: Vec, forward: Vec): Vec | null {
    const vLen = length(v);
    if (!(vLen > 0) || !Number.isFinite(vLen)) return null;
    const d = dot(v, forward);
    const projected = {
        x: v.x - d * forward.x,
        y: v.y - d * forward.y,
        z: v.z - d * forward.z,
    };
    if (length(projected) <= DEGENERATE_EPS * vLen) return null;
    return normalizeOrNull(projected);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const initialForward = normalizeOrNull(sub(target, eye));
    if (!initialForward) {
        throw new Error("createChaseCamera: eye and target must be distinct");
    }

    // "Starts upright": world +Y, unless the view is vertical, in which case
    // +Y gives no roll reference and +Z is used instead.
    const initialUp =
        uprightFor({ x: 0, y: 1, z: 0 }, initialForward) ??
        uprightFor({ x: 0, y: 0, z: 1 }, initialForward) ??
        { x: 0, y: 1, z: 0 };

    const camera = createBankedFreeCamera(eye, target, initialUp);

    // The last up that was actually applied. Kept so that a degenerate call can
    // hold the previous roll.
    let lastUp: Vec = initialUp;

    const applyUp = (up: Vec): void => {
        camera.upVector.x = up.x;
        camera.upVector.y = up.y;
        camera.upVector.z = up.z;
        lastUp = up;
    };

    return {
        camera,
        bank(up: Vec): void {
            const forward = normalizeOrNull(sub(camera.target, camera.position));
            if (!forward) return; // eye and target coincide; nothing sensible to do

            const next = uprightFor(up, forward);
            if (next) {
                applyUp(next);
                return;
            }

            // Car up is along the line of sight (or zero): keep the previous roll.
            // Re-project the previous up onto the current plane so the camera
            // stays orthogonal to its view direction if the view has moved.
            const kept = uprightFor(lastUp, forward);
            if (kept) applyUp(kept);
        },
    };
}
