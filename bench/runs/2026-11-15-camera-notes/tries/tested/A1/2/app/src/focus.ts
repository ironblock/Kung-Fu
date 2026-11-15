import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centres an orbit camera on `point` without changing its angles or radius.
 * The camera moves by the same offset as the old target-to-point offset and
 * keeps orbiting `point` from then on. Safe to call repeatedly.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Drop pending inertia so later frames don't drift the pose away from `point`.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Write the target in place. Assigning a new object does not mark the camera dirty,
    // and copying the values (rather than keeping a reference) keeps the camera's own
    // target object as the single source of truth.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // A target change only takes effect on the next alpha/beta/radius write. Re-writing
    // the current values (which limits already allow) makes the new target visible now,
    // so the camera position and view are correct in the same frame.
    camera.alpha = camera.alpha;
    camera.beta = camera.beta;
    camera.radius = camera.radius;
}
