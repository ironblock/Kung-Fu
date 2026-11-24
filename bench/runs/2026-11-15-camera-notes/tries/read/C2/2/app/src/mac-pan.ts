import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `canvas`,
 * and additionally makes Ctrl + primary-button drag pan the camera.
 *
 * How it works: the library maps mouse button 0 to rotate and button 2 to pan.
 * A capture-phase pointerdown listener, registered before attachControl, marks
 * Ctrl + primary presses (mouse only) and makes the event report button 2 to the
 * library's handlers. Everything else (move, glide, wheel, pinch, right drag) is
 * untouched, so Ctrl-pan uses exactly the same pan path as a right-button drag.
 *
 * Returns a function that removes every listener and per-frame hook it added.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    let ctrlPanPress = false;

    // Capture phase on the canvas, registered before attachControl, so this runs
    // before the library's pointerdown handler sees the same event object.
    const onPointerDown = (event: PointerEvent): void => {
        ctrlPanPress = event.ctrlKey && event.button === 0 && event.pointerType === "mouse";
        if (!ctrlPanPress) {
            return;
        }
        // An own property shadows the MouseEvent.prototype.button getter for this
        // event object only. The library then reads 2 and applies its pan mapping.
        Object.defineProperty(event, "button", { value: 2, configurable: true });
    };

    // On macOS, Ctrl + click opens the context menu; suppress it for a Ctrl-pan press.
    const onContextMenu = (event: MouseEvent): void => {
        if (ctrlPanPress) {
            event.preventDefault();
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown, { capture: true });
    canvas.addEventListener("contextmenu", onContextMenu);

    const detachControl = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControl();
        canvas.removeEventListener("pointerdown", onPointerDown, { capture: true });
        canvas.removeEventListener("contextmenu", onContextMenu);
        ctrlPanPress = false;
    };
}
