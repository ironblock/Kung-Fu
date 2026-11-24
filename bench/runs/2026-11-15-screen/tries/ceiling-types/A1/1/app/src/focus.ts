import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make `camera` orbit `point`, keeping its alpha, beta and radius.
 *
 * Only the orbit centre changes, so the eye moves by exactly the offset from
 * the old centre to `point`, and the camera looks straight at `point`.
 *
 * The change is visible at once: `camera.target` is the camera's own
 * observable vector, and writing its components marks the camera's world
 * matrix dirty in the same statement. So `getCameraPosition`, `getViewMatrix`
 * and `getViewProjectionMatrix` return the new pose straight after this call.
 *
 * Safe to call any number of times in a row.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy first: `point` may be a reused pick/scratch vector, or the camera's
    // own target. The camera never keeps a reference to it.
    const x = point.x;
    const y = point.y;
    const z = point.z;

    // A NaN/Infinity centre would corrupt the camera's matrices for good, so
    // treat a bad point (e.g. a missed pick) as "no focus change".
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        return;
    }

    // Leftover pan momentum shifts the target on the next frames, which would
    // move the orbit centre off `point`. Rotation and zoom momentum are kept:
    // they change only angles and distance, so the camera still orbits `point`.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Change the existing target vector in place. Do not assign a new object
    // to `camera.target`: a plain object is not observable, so the cached
    // view would not update this frame, and the camera's internals may keep
    // reading the original vector when angles or distance change later.
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;
}
