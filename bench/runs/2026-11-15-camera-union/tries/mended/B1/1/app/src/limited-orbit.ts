import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's mouse/touch orbit controls to `camera`, with the
 * camera's radius (distance from its orbit target) kept within
 * [minDistance, maxDistance].
 *
 * Returns a function that removes the controls and the radius limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance}, ${maxDistance}`);
    }

    // Install the radius bounds through setCameraLimits: plain writes to the
    // limit fields do not clamp anything. setCameraLimits clamps writes made
    // after this call and clamps each frame, so the scene is needed here.
    const stopLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Bring a camera that starts outside the range inside now.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    // The scene is required: without it, drags and wheel do nothing.
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        stopLimits();
        // Remove the radius bounds this function added; the limit fields are
        // otherwise left set on the camera. Passing undefined removes a bound.
        const stopClearingLimits = setCameraLimits(
            camera,
            { lowerRadiusLimit: undefined, upperRadiusLimit: undefined },
            scene,
        );
        stopClearingLimits();
    };
}
