import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drag events that can turn the camera. The library's own handler runs during
// one of these events and adds its rotation to camera.inertialAlphaOffset and
// camera.inertialBetaOffset. We measure that addition and add it once more,
// so every drag step turns the camera twice as far. The glide after release
// comes from the same offsets, so it doubles too.
const DRAG_EVENTS = ["pointermove", "mousemove", "touchmove"] as const;

export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Standard mouse and touch controls, with default options.
    const detachControls = attachControl(camera, canvas, scene);

    const win: Window = canvas.ownerDocument.defaultView ?? window;

    let alphaBefore = 0;
    let betaBefore = 0;

    // Capture phase on window runs before any listener on the canvas or below it.
    const onDragCapture = (): void => {
        alphaBefore = camera.inertialAlphaOffset;
        betaBefore = camera.inertialBetaOffset;
    };

    // Bubble phase on window runs after the canvas and document listeners.
    // Anything the library added during this event is added once more.
    const onDragBubble = (): void => {
        const alphaAdded = camera.inertialAlphaOffset - alphaBefore;
        const betaAdded = camera.inertialBetaOffset - betaBefore;
        camera.inertialAlphaOffset += alphaAdded;
        camera.inertialBetaOffset += betaAdded;
    };

    for (const type of DRAG_EVENTS) {
        win.addEventListener(type, onDragCapture, true);
        win.addEventListener(type, onDragBubble, false);
    }

    return () => {
        for (const type of DRAG_EVENTS) {
            win.removeEventListener(type, onDragCapture, true);
            win.removeEventListener(type, onDragBubble, false);
        }
        detachControls();
    };
}
