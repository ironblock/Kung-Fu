import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Same threshold the library's inertia step uses to snap a rotation offset to zero. */
const ROTATION_EPSILON = 0.001;

/**
 * The library's standard arc-rotate mouse and touch controls, with orbit turns
 * (drag and glide) doubled.
 *
 * The library accumulates drag into `inertialAlphaOffset` / `inertialBetaOffset`
 * and, once per frame, applies them and decays them. Its decay snaps small
 * offsets to zero at an absolute threshold, so doubling the input (for example
 * by halving `angularSensibility`) would not double the glide exactly. Instead,
 * for each frame:
 *
 *   1. a hook registered before the library's inertia step doubles the pending
 *      rotation offsets, so the library applies twice the turn;
 *   2. a hook registered after it restores the offsets to the library's own
 *      decayed value for a single turn, so the glide that follows is decayed
 *      exactly as the library decays it, and only the applied amount is doubled.
 *
 * Wheel zoom, right-button pan and pinch are untouched. The returned function
 * detaches the library controls and removes both per-frame hooks.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let pendingAlpha = 0;
    let pendingBeta = 0;
    let doubled = false;

    const doubleTurn = (): void => {
        const a = camera.inertialAlphaOffset;
        const b = camera.inertialBetaOffset;
        doubled = a !== 0 || b !== 0;
        pendingAlpha = a;
        pendingBeta = b;
        camera.inertialAlphaOffset = a * 2;
        camera.inertialBetaOffset = b * 2;
    };

    const restoreGlide = (): void => {
        if (!doubled) {
            return;
        }
        doubled = false;
        camera.inertialAlphaOffset = decay(pendingAlpha, camera.inertia);
        camera.inertialBetaOffset = decay(pendingBeta, camera.inertia);
    };

    scene._beforeRender.push(doubleTurn);
    const detachControls = attachControl(camera, canvas, scene);
    scene._beforeRender.push(restoreGlide);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        removeHook(scene, doubleTurn);
        removeHook(scene, restoreGlide);
    };
}

/** Same arithmetic as the library's per-frame decay of one rotation offset. */
function decay(offset: number, factor: number): number {
    const next = offset * factor;
    return Math.abs(next) < ROTATION_EPSILON ? 0 : next;
}

function removeHook(scene: SceneContext, hook: () => void): void {
    const idx = scene._beforeRender.indexOf(hook);
    if (idx >= 0) {
        scene._beforeRender.splice(idx, 1);
    }
}
