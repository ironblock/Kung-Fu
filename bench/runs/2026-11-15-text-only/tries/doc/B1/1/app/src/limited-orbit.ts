import { attachControl, onBeforeRender } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's default orbit/zoom/pinch controls to `camera`, with the
 * camera distance (radius) clamped to [minDistance, maxDistance].
 *
 * Wheel zoom goes through the library's inertia offset, which is applied in the
 * scene's beforeRender pass. Pinch zoom writes `camera.radius` directly during
 * touchmove. The clamp therefore runs in both places:
 *   - on the canvas touchmove / gesturechange events, after the library's own
 *     handlers (they were registered earlier on the same target), and
 *   - once per frame, after the library's inertia step (registered after
 *     attachControl, so it runs later in the same beforeRender pass).
 *
 * Returns a cleanup function that removes every listener and the per-frame hook.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Clamp the radius into range. When a limit is hit, drop any zoom still queued
    // in the inertia offset so it cannot keep pushing the radius out of range and
    // delay a reversal of the gesture.
    const limit = (): void => {
        const r = camera.radius;
        if (r >= minDistance && r <= maxDistance) {
            return;
        }
        camera.radius = r < minDistance ? minDistance : maxDistance;
        camera.inertialRadiusOffset = 0;
    };

    // Must come after attachControl so the library's applyInertia hook runs first.
    const detach = attachControl(camera, canvas, scene);

    // Bring an out-of-range starting radius inside immediately.
    limit();

    // Pinch and gesture zoom write radius directly; clamp right after the library's handlers.
    canvas.addEventListener("touchmove", limit);
    canvas.addEventListener("gesturechange", limit);

    // Runs after the library's inertia step in the same frame, so the rendered radius is in range.
    const unhook = onBeforeRender(scene, limit);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        canvas.removeEventListener("touchmove", limit);
        canvas.removeEventListener("gesturechange", limit);
        unhook();
        detach();
    };
}
