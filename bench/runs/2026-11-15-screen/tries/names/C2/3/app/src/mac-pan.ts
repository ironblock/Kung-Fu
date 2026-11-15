import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, ArcRotatePointerMappings, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit-camera controls to `canvas`, and makes
 * Ctrl + primary-button drag pan the camera (as a right-button drag does)
 * instead of orbiting it.
 *
 * Mechanism: the library reads the primary-button action from the
 * `pointerMappings` object. Before each pointerdown reaches the library, we set
 * that action to "pan" when Ctrl is held and "rotate" otherwise. The library
 * therefore performs its own pan, including its sensitivity and inertia.
 *
 * Returns a function that removes the canvas listener and detaches the library
 * controls. The library's per-frame work is its own and is removed by its dispose.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const pointerMappings: ArcRotatePointerMappings = {
        primaryButton: "rotate",
        secondaryButton: "pan",
    };

    // Registered in the capture phase so the mapping is updated before the library's
    // pointerdown handling runs.
    const onPointerDownCapture = (event: PointerEvent): void => {
        pointerMappings.primaryButton = event.button === 0 && event.ctrlKey ? "pan" : "rotate";
    };

    const detachLibraryControls = attachControl(camera, canvas, scene, { pointerMappings });
    canvas.addEventListener("pointerdown", onPointerDownCapture, { capture: true });

    return () => {
        canvas.removeEventListener("pointerdown", onPointerDownCapture, { capture: true });
        detachLibraryControls();
    };
}
