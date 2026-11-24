import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the orbit camera orbit `point` instead of its current target.
 *
 * The camera keeps its alpha, beta and radius, so its position moves by the
 * same offset as the target does, and it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the components in place. Assigning a new object to `target` does
    // not mark the camera dirty, and later code may hold a reference to it.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Writing target in place does not mark the camera dirty either. Only a
    // write to alpha, beta or radius that changes its value does, so make one.
    markCameraDirty(camera);
}

/**
 * Forces the camera to recompute its pose from the current angles and target.
 * It nudges alpha (or radius if alpha cannot move, e.g. because of limits)
 * to a value that really differs, then restores the exact original value.
 */
function markCameraDirty(camera: ArcRotateCamera): void {
    if (nudge(camera, "alpha")) return;
    nudge(camera, "radius");
}

function nudge(camera: ArcRotateCamera, key: "alpha" | "radius"): boolean {
    const original = camera[key];
    const step = 1e-6 * Math.max(1, Math.abs(original));
    for (const delta of [step, -step]) {
        camera[key] = original + delta;
        if (camera[key] !== original) {
            // Restore the exact original value. This write changes the value
            // again, so it marks the camera dirty as well.
            camera[key] = original;
            return true;
        }
    }
    // Neither direction changed the value: restore it and report failure.
    camera[key] = original;
    return false;
}
