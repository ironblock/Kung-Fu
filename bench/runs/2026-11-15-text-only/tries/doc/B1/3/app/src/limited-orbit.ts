import { attachControl, onBeforeRender } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to an ArcRotateCamera, keeping the camera's
 * distance from its orbit target within [minDistance, maxDistance].
 *
 * The library applies wheel zoom through `inertialRadiusOffset` inside its own
 * per-frame `beforeRender` hook, and pinch zoom writes `radius` directly on
 * touchmove. Both can push the radius out of range, so a clamp runs in a
 * `beforeRender` hook registered after the controls' hook. It therefore runs
 * after the controls have applied their input and before the frame renders.
 *
 * Returns a cleanup function that removes the controls and the clamp hook.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    const clampRadius = (): void => {
        const r = camera.radius;
        if (r >= minDistance && r <= maxDistance) {
            return;
        }
        // NaN fails both comparisons above; treat it as the minimum.
        const clamped = Number.isNaN(r) ? minDistance : Math.min(maxDistance, Math.max(minDistance, r));
        camera.radius = clamped;
        // Drop any pending zoom that would keep pushing past the limit, so a
        // reversed scroll responds immediately instead of after the residue decays.
        camera.inertialRadiusOffset = 0;
    };

    // Bring an out-of-range starting distance inside before any input is handled.
    clampRadius();

    const detachControls = attachControl(camera, canvas, scene);

    // Registered after attachControl's hook, so it runs after the controls' inertia step.
    const removeClamp = onBeforeRender(scene, clampRadius);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        removeClamp();
        detachControls();
    };
}
