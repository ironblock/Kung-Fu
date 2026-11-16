import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an orbit camera the library's default mouse and touch controls, but
 * with drag turns doubled.
 *
 * The library's drag adds to camera.inertialAlphaOffset / inertialBetaOffset
 * inside pointer-move handling; a scene callback then applies and decays those
 * offsets. Since that is linear, adding one more copy of each pointer-move
 * increment makes the turn twice as large, and the glide after release doubles
 * with it. Wheel zoom (inertialRadiusOffset), pinch zoom, keyboard keys and
 * panning are left untouched.
 *
 * Returns a function that removes all controls and listeners.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Library controls first, so their pointermove handler is registered before ours.
    const detachLibraryControls = attachControl(camera, canvas, scene);

    let alphaBefore = 0;
    let betaBefore = 0;

    // Capture phase on window runs before the library's pointer-move handling.
    const onPointerMoveStart = (): void => {
        alphaBefore = camera.inertialAlphaOffset;
        betaBefore = camera.inertialBetaOffset;
    };

    // Bubble phase on window runs after it. Add the same increment again.
    const onPointerMoveEnd = (): void => {
        camera.inertialAlphaOffset += camera.inertialAlphaOffset - alphaBefore;
        camera.inertialBetaOffset += camera.inertialBetaOffset - betaBefore;
    };

    window.addEventListener("pointermove", onPointerMoveStart, { capture: true });
    window.addEventListener("pointermove", onPointerMoveEnd);

    return (): void => {
        window.removeEventListener("pointermove", onPointerMoveStart, { capture: true });
        window.removeEventListener("pointermove", onPointerMoveEnd);
        detachLibraryControls();
    };
}
