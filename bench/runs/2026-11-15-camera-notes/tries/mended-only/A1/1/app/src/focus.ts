import type { ArcRotateCamera } from "@babylonjs/lite";

type OrbitChannel = "alpha" | "beta" | "radius";

const NUDGE = 1e-3;

/**
 * Makes the camera orbit `point`. Angles and radius are kept, so the camera
 * moves by the same offset as from the old target to `point`, and it looks at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Edit the target in place; assigning a new object to it is not picked up by the matrix (notes 5).
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // An in-place target edit marks nothing dirty, so the matrix is rebuilt only after an
    // alpha, beta or radius write that really changes the value. Do such a write, then restore
    // the exact original value. Writes clamped to a limit change nothing, so try the next one.
    if (!forceRebuild(camera)) {
        throw new Error("focusOn: could not mark the camera dirty; no alpha, beta or radius write changed");
    }

    // Build the matrix now, so the view and the position are current in this frame.
    camera.getViewMatrix();
}

function forceRebuild(camera: ArcRotateCamera): boolean {
    const channels: OrbitChannel[] = ["alpha", "beta", "radius"];
    for (const channel of channels) {
        const original = camera[channel];
        for (const step of [NUDGE, -NUDGE]) {
            camera[channel] = original + step;
            if (camera[channel] !== original) {
                camera[channel] = original;
                return true;
            }
        }
    }
    return false;
}
