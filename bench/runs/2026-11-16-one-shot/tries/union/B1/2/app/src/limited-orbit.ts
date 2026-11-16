import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

type RadiusLimitKey = "lowerRadiusLimit" | "upperRadiusLimit";

/**
 * Attaches the library's orbit controls to `camera` and keeps its radius
 * (distance from the orbit target) within [minDistance, maxDistance].
 *
 * The returned function removes the controls and stops the range clamp,
 * then restores the camera's radius limit fields to the values they had
 * before this call.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (
        !(
            Number.isFinite(minDistance) &&
            Number.isFinite(maxDistance) &&
            minDistance > 0 &&
            minDistance <= maxDistance
        )
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    const radiusKeys: readonly RadiusLimitKey[] = ["lowerRadiusLimit", "upperRadiusLimit"];
    const previous = radiusKeys.map((key) => [key, camera[key]] as const);

    // Mouse and touch orbit, pan and zoom input. The scene is passed so that
    // drags and wheel input move the camera immediately, not only on _beforeRender.
    const detachControls = attachControl(camera, canvas, scene);

    // Clamps the current radius at once and clamps every later radius write
    // (wheel, pinch, and the inertial step) to the new range.
    const stopClamping = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;

        stopClamping();
        detachControls();

        for (const [key, value] of previous) {
            if (value === undefined) {
                delete camera[key];
            } else {
                camera[key] = value;
            }
        }
    };
}
