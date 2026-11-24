import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, ArcRotatePointerMappings, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's default orbit controls to `canvas`, plus Ctrl+primary-button drag to pan.
 *
 * The library's own pan path is used (same sensitivity and glide), so a Ctrl-drag behaves like a
 * right-button drag. Only the primary button's action is switched, per pointerdown:
 * "pan" when Ctrl is held, "rotate" otherwise. Everything else stays at the library defaults.
 *
 * Returns a function that detaches the controls and removes every listener added here.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Kept as a mutable object so the primary-button action can change per press.
    const pointerMappings: ArcRotatePointerMappings = {
        primaryButton: "rotate",
        secondaryButton: "pan",
    };

    const detachControls = attachControl(camera, canvas, scene, { pointerMappings });

    // Capture phase on window runs before the library's canvas listeners, so the mapping is set
    // before the library reads it for this press.
    const onPointerDown = (event: PointerEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        pointerMappings.primaryButton = event.ctrlKey ? "pan" : "rotate";
    };

    // On macOS, Ctrl+click opens the context menu. Suppress it on the canvas so Ctrl-drag is not interrupted.
    const onContextMenu = (event: Event): void => {
        event.preventDefault();
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        window.removeEventListener("pointerdown", onPointerDown, { capture: true });
        canvas.removeEventListener("contextmenu", onContextMenu);
        detachControls();
    };
}
