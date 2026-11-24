import { attachControl, onBeforeRender } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) and keeps the camera's radius, the distance from
 * its orbit target, within [minDistance, maxDistance].
 *
 * Returns a function that removes the controls and the per-frame clamp.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(`Invalid zoom range: min=${minDistance}, max=${maxDistance}`);
    }

    // Runs once per frame. It is also safe to run before or after the controls'
    // own per-frame inertia step, so the order of the two hooks does not matter:
    // - the radius is clamped directly (pinch writes radius between frames);
    // - the pending zoom offset is limited so that applying it (radius -= offset)
    //   can only land inside the range, and it is zeroed when it would push past a limit.
    const enforceRange = (): void => {
        let radius = camera.radius;
        if (radius < minDistance) {
            radius = minDistance;
        } else if (radius > maxDistance) {
            radius = maxDistance;
        }
        if (radius !== camera.radius) {
            camera.radius = radius;
        }

        const lowest = radius - maxDistance; // offset >= this keeps radius <= maxDistance
        const highest = radius - minDistance; // offset <= this keeps radius >= minDistance
        const offset = camera.inertialRadiusOffset;
        if (offset < lowest) {
            camera.inertialRadiusOffset = lowest;
        } else if (offset > highest) {
            camera.inertialRadiusOffset = highest;
        }
    };

    // Bring an out-of-range starting camera inside before anything is rendered.
    enforceRange();

    const detachControls = attachControl(camera, canvas, scene);
    const removeFrameHook = onBeforeRender(scene, enforceRange);

    return (): void => {
        removeFrameHook();
        detachControls();
    };
}
