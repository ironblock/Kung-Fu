import type { ArcRotateCamera } from "@babylonjs/lite";

// Size of the temporary alpha change used to force the camera to pick up the new target.
const NUDGE = 1e-4;

/**
 * Makes the arc-rotate camera orbit `point`. Its alpha, beta and radius are kept,
 * so it moves by the same offset as from the old target to `point`, and it still
 * looks straight at `point`. Takes effect immediately, in the same frame.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Pending inertia from earlier drags would move the camera (and possibly the target) on the next frame.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Move the orbit centre in place. Assigning a new object to `target` is not
    // picked up, so write the components.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Writes to `target` do not mark the camera dirty; the next alpha/beta/radius
    // write that changes its value does. Change alpha to a nearby in-range value
    // and then restore it exactly, so the new target is applied now.
    const alpha = camera.alpha;
    const inRange = (a: number): boolean =>
        (camera.upperAlphaLimit === undefined || a <= camera.upperAlphaLimit) &&
        (camera.lowerAlphaLimit === undefined || a >= camera.lowerAlphaLimit);

    let other = alpha + NUDGE;
    if (!inRange(other)) {
        other = alpha - NUDGE;
    }
    if (other !== alpha && inRange(other)) {
        camera.alpha = other;
        camera.alpha = alpha;
    }
}
