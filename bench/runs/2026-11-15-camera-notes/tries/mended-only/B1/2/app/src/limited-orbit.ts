import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the orbit distance held between
 * `minDistance` and `maxDistance`.
 *
 * The range is enforced by the library's own limit mechanism
 * (lowerRadiusLimit / upperRadiusLimit + setCameraLimits), which clamps every
 * radius write, so no per-frame code of ours is needed.
 *
 * Returns a function that removes the controls, stops the limits and restores
 * the camera's previous limit values.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0) || !Number.isFinite(maxDistance) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Remember the previous limits so the returned function can put them back.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Hand-set limit fields only take effect once setCameraLimits runs.
    camera.lowerRadiusLimit = minDistance;
    camera.upperRadiusLimit = maxDistance;
    const stopLimits = setCameraLimits(camera);

    // Bring a camera that starts outside the range inside, right away.
    if (camera.radius < minDistance) {
        camera.radius = minDistance;
    } else if (camera.radius > maxDistance) {
        camera.radius = maxDistance;
    }

    // Controls are attached after the limits, so wheel and pinch writes are
    // clamped from the first input onwards.
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        stopLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
