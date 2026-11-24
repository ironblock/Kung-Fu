import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, ArcRotatePointerMappings, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate controls to `canvas`, plus a
 * Ctrl + primary-button drag that pans the camera (for Mac laptops without a
 * right button).
 *
 * The library's own pan path is reused for Ctrl-drag, so sensitivity, panning
 * inertia (glide) and limits behave exactly as they do for a right-button drag.
 *
 * Mechanism: the library's pointer mappings object is owned here. On a
 * primary-button pointerdown with Ctrl held, `primaryButton` is switched to
 * "pan" for the duration of that gesture, and restored to "rotate" on release.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const mappings: ArcRotatePointerMappings = {
        primaryButton: "rotate",
        secondaryButton: "pan",
    };

    let ctrlPanActive = false;

    const setCtrlPan = (active: boolean): void => {
        ctrlPanActive = active;
        mappings.primaryButton = active ? "pan" : "rotate";
    };

    // Capture phase on the canvas so this runs before the library's own
    // pointerdown handler reads the mapping.
    const onPointerDown = (e: PointerEvent): void => {
        if (e.button === 0 && e.ctrlKey) {
            setCtrlPan(true);
        }
    };

    const endCtrlPan = (): void => {
        if (ctrlPanActive) {
            setCtrlPan(false);
        }
    };

    // macOS fires a contextmenu event for Ctrl + click; suppress it for a Ctrl-pan gesture.
    const onContextMenu = (e: Event): void => {
        if (ctrlPanActive) {
            e.preventDefault();
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown, true);
    canvas.addEventListener("contextmenu", onContextMenu, true);
    window.addEventListener("pointerup", endCtrlPan, true);
    window.addEventListener("pointercancel", endCtrlPan, true);
    window.addEventListener("blur", endCtrlPan);

    const detachControls = attachControl(camera, canvas, scene, { pointerMappings: mappings });

    return () => {
        detachControls();
        canvas.removeEventListener("pointerdown", onPointerDown, true);
        canvas.removeEventListener("contextmenu", onContextMenu, true);
        window.removeEventListener("pointerup", endCtrlPan, true);
        window.removeEventListener("pointercancel", endCtrlPan, true);
        window.removeEventListener("blur", endCtrlPan);
        endCtrlPan();
    };
}
