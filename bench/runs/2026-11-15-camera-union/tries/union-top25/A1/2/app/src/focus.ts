import type { ArcRotateCamera } from "@babylonjs/lite";

type PoseKey = "alpha" | "beta" | "radius";

/**
 * Make the camera orbit `point`, keeping its alpha, beta and radius.
 * The camera moves by the same offset as the old centre to `point`, and
 * it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    const x = point.x;
    const y = point.y;
    const z = point.z;

    // Write the target in place: assigning a new object is not picked up
    // (see camera-notes.md, note 3).
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;

    // A target write does not mark the camera dirty, so the view would
    // stay stale until the next angle/distance change. Force a refresh now
    // with a value-changing write to a pose field, then restore it.
    markDirty(camera);
}

function markDirty(camera: ArcRotateCamera): void {
    if (nudge(camera, "alpha")) return;
    if (nudge(camera, "radius")) return;
    nudge(camera, "beta");
}

// Changes the field by a tiny amount and restores it. Returns false when
// the write did not change the value (for example, it was clamped back to
// the current value by a limit).
function nudge(camera: ArcRotateCamera, key: PoseKey): boolean {
    const v = camera[key];
    const d = 1e-6 * Math.max(1, Math.abs(v));
    for (const s of [d, -d]) {
        camera[key] = v + s;
        if (camera[key] !== v) {
            camera[key] = v;
            return true;
        }
    }
    return false;
}
