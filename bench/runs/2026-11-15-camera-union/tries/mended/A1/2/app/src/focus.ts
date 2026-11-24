import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`, keeping its alpha, beta and radius.
 *
 * Because the camera's eye is derived from `target` plus the angles and radius,
 * moving `target` moves the eye by the same offset (point - oldTarget).
 *
 * Per camera-notes.md (notes 2 and 22), assigning a new target object or writing
 * target in place does not by itself mark the camera dirty; the change is only
 * picked up by the next alpha/beta/radius write that changes its value. So after
 * moving the target we nudge one pose value away and back. Both writes change the
 * value, so the view is rebuilt for the current frame, and the pose ends up exactly
 * as it was.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write in place: the camera keeps its existing target object.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    markDirty(camera);
}

type PoseKey = "alpha" | "beta" | "radius";

function markDirty(camera: ArcRotateCamera): void {
    // Try alpha, then radius, then beta. For each, try a small step up, then down,
    // because a limit may clamp the first direction to the current value.
    const keys: PoseKey[] = ["alpha", "radius", "beta"];
    for (const key of keys) {
        if (nudge(camera, key)) {
            return;
        }
    }
    // No pose value could be changed (all pinned at limits in both directions).
    // Leave the camera as it is; the target is already updated.
}

function nudge(camera: ArcRotateCamera, key: PoseKey): boolean {
    const v = camera[key];
    const step = 1e-4 * Math.max(1, Math.abs(v));
    for (const d of [step, -step]) {
        camera[key] = v + d;
        if (camera[key] !== v) {
            // Restore the exact original value. v was already accepted, so it is not clamped.
            camera[key] = v;
            return true;
        }
    }
    return false;
}
