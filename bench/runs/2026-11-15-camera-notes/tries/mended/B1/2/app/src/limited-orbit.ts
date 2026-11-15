import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Gives an orbit camera the library's standard mouse/touch controls (drag to
 * orbit, wheel and pinch to zoom) while keeping its radius between
 * `minDistance` and `maxDistance`.
 *
 * Returns a function that removes the controls and the limits.
 */
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

    // Clamps the current radius now (so an out-of-range camera is brought in
    // immediately) and clamps every later radius write, including pinch zoom
    // and the inertia applied each frame.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Wheel zoom accumulates in inertialRadiusOffset, which the limits do not
    // clamp. Without this, a hard scroll past the limit leaves a hidden offset
    // that delays the response when the user zooms back. This listener is
    // registered after attachControl's, so it runs after the library has added
    // the wheel step, and it trims the offset so radius + offset stays in range.
    const detachControls = attachControl(camera, canvas, scene);
    const trimWheelOffset = (): void => {
        const predicted = camera.radius + camera.inertialRadiusOffset;
        const inRange = Math.min(maxDistance, Math.max(minDistance, predicted));
        camera.inertialRadiusOffset = inRange - camera.radius;
    };
    canvas.addEventListener("wheel", trimWheelOffset);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        canvas.removeEventListener("wheel", trimWheelOffset);
        detachControls();
        releaseLimits();
    };
}
