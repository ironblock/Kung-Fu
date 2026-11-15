import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A primary-button press with Ctrl held (the Mac stand-in for a right-button drag).
function isCtrlPrimaryPress(event: PointerEvent): boolean {
    return event.button === 0 && event.ctrlKey;
}

/**
 * Attaches the library's orbit controls to the camera, with Ctrl + primary-button drag
 * acting as a pan. Returns a function that removes every listener this attached.
 *
 * Two attachControl instances share the canvas. Each pointerdown is routed to exactly one
 * of them by shouldHandlePointerDown:
 *  - "orbit" instance: everything except Ctrl + primary (primary = rotate, secondary = pan,
 *    wheel, pinch, keyboard: the library defaults).
 *  - "ctrl-pan" instance: Ctrl + primary only, mapped to pan. Its keyboard is off so keys
 *    are not handled twice.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachOrbit = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event) => !isCtrlPrimaryPress(event),
    });

    const detachCtrlPan = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "pan" },
        shouldHandlePointerDown: (event) => isCtrlPrimaryPress(event),
        keyboard: false,
    });

    return () => {
        detachCtrlPan();
        detachOrbit();
    };
}
