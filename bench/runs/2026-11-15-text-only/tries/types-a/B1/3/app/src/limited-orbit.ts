import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and pinch
 * to zoom) to `camera`, with the camera's radius (distance from its orbit
 * target) kept within [minDistance, maxDistance].
 *
 * The range is enforced by `setCameraLimits`, which clamps inside the camera's
 * radius setters, so wheel, pinch and inertial zoom cannot leave the range on
 * any frame. If the camera starts outside the range it is moved inside
 * immediately.
 *
 * @returns A cleanup function that detaches the canvas listeners and removes
 * the limit hook. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Installs the self-clamp hook and moves the current radius into range now.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let detachControls: (() => void) | undefined;
    try {
        // Belt and braces: the setter clamp should already have handled this,
        // but write the clamped radius explicitly so the starting pose is in range.
        camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        disposeLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        // Stop input first, then drop the limit hook.
        detachControls?.();
        disposeLimits();
    };
}
