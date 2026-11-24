import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("minDistance and maxDistance must be finite numbers");
    }
    if (minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError("Expected 0 < minDistance <= maxDistance");
    }

    // Remember the caller's own radius limits so dispose can put them back.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Installing the limits clamps the current pose at once, and every later
    // radius write is clamped in the same statement (see notes 2, 29, 33).
    // Zoom and pinch both write radius, so both stay inside the range.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Drag, wheel and pinch controls. Passing the scene makes drags and wheel
    // apply on the frame hook (note 1).
    const releaseControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;

        // Stop input first, then stop the radius clamp.
        releaseControls();
        releaseLimits();

        // setCameraLimits leaves the limit fields set after its disposer runs
        // (note 62), so restore the caller's values directly.
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
