import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls, with drag rotation doubled.
 *
 * The library's pointer and touch handlers add rotation into camera.inertialAlphaOffset
 * and camera.inertialBetaOffset. The per-frame inertia pass then applies and decays those
 * offsets, so the glide after release comes from the same offsets. Doubling the increment
 * each input event adds therefore doubles both the drag and the glide.
 *
 * Only pointer and touch move events change the rotation offsets (wheel and pinch change
 * radius, pan changes inertialPanning*), so the per-event delta is exactly the rotation the
 * library just added for that input.
 *
 * Ordering: the snapshot listeners are registered on window in the capture phase before
 * attachControl runs, and the amplify listeners in the bubble phase after it. The snapshot
 * therefore sees the offsets before the library touches them, and the amplify step sees
 * them after the library has finished for that event.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    const snapshot = (): void => {
        alphaBefore = camera.inertialAlphaOffset;
        betaBefore = camera.inertialBetaOffset;
    };

    const amplify = (): void => {
        const alphaAdded = camera.inertialAlphaOffset - alphaBefore;
        const betaAdded = camera.inertialBetaOffset - betaBefore;
        camera.inertialAlphaOffset += alphaAdded;
        camera.inertialBetaOffset += betaAdded;
    };

    const captureOptions: AddEventListenerOptions = { capture: true, passive: true };
    const bubbleOptions: AddEventListenerOptions = { passive: true };
    const dragEvents = ["pointermove", "touchmove"] as const;

    for (const type of dragEvents) {
        window.addEventListener(type, snapshot, captureOptions);
    }

    const detachLibraryControls = attachControl(camera, canvas, scene);

    for (const type of dragEvents) {
        window.addEventListener(type, amplify, bubbleOptions);
    }

    return () => {
        detachLibraryControls();
        for (const type of dragEvents) {
            window.removeEventListener(type, snapshot, captureOptions);
            window.removeEventListener(type, amplify, bubbleOptions);
        }
    };
}
