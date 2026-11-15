import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Orbit camera looking at the origin from 10 units away, with the library's
 * standard mouse/touch controls attached to `canvas`.
 *
 * NOTE (unverified against the library, which is not available here):
 * - The exact signatures of `createArcRotateCamera` and `attachControl` are
 *   assumed. camera-ledger.toml confirms both functions exist in src/camera and
 *   that `attachControl` only installs its per-frame (inertia) hook when it is
 *   given a scene, so `scene` is passed explicitly.
 * - The ledger records that camera modules never register with scene disposal,
 *   so the disposer returned by `attachControl` (if any) is the only way to
 *   detach the controls. This function's required signature returns only the
 *   camera, so that disposer is dropped here.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(scene);

    // target is an ObservableVec3 and the arc-rotate setters run the limits
    // clamp, so setting fields after creation is the documented-safe route.
    camera.target.set(0, 0, 0);
    camera.radius = 10;

    attachControl(camera, canvas, scene);

    // TODO: turn on the library's built-in arrow-key control. Neither the
    // camera ledger nor anything on this machine names that API for
    // Babylon Lite 1.39.0, so it is deliberately not guessed here.

    return camera;
}
