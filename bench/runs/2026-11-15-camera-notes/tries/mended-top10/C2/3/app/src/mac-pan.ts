import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Orbit/pan/zoom controls for an ArcRotateCamera with Ctrl + primary-button drag
 * acting as a right-button (secondary) drag, i.e. a pan.
 *
 * The library picks the action for a button when controls are attached, so a
 * single attachControl call cannot make the primary button both orbit and pan.
 * Instead, while a Ctrl + primary-button drag is in progress, the pointer events
 * for that pointer are given button 2 / buttons 2 (the secondary button) before
 * the library sees them. The library then runs its normal right-button pan path,
 * so sensitivity, inertia ("glide") and clamping are identical to a right-button drag.
 * All other input (plain primary drag, right drag, wheel, pinch) is untouched.
 *
 * Returns a function that removes every listener added here and detaches the library controls.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const SECONDARY_BUTTON = 2;
    // Pointer currently being dragged with Ctrl + primary button, or null.
    let ctrlPanPointerId: number | null = null;

    const forceButtons = (event: PointerEvent, button: number, buttons: number): void => {
        Object.defineProperty(event, "button", { configurable: true, value: button });
        Object.defineProperty(event, "buttons", { configurable: true, value: buttons });
    };

    // Window capture phase: runs before any library listener, whatever element it is on.
    const onPointerDown = (event: PointerEvent): void => {
        if (event.target !== canvas) return;
        if (event.button !== 0 || !event.ctrlKey) return;
        if (ctrlPanPointerId !== null) return;
        ctrlPanPointerId = event.pointerId;
        forceButtons(event, SECONDARY_BUTTON, SECONDARY_BUTTON);
    };

    const onPointerMove = (event: PointerEvent): void => {
        if (ctrlPanPointerId === null || event.pointerId !== ctrlPanPointerId) return;
        forceButtons(event, event.button, SECONDARY_BUTTON);
    };

    const onPointerEnd = (event: PointerEvent): void => {
        if (ctrlPanPointerId === null || event.pointerId !== ctrlPanPointerId) return;
        ctrlPanPointerId = null;
        forceButtons(event, SECONDARY_BUTTON, 0);
    };

    // On macOS, Ctrl + click opens the context menu; suppress it on the canvas.
    const onContextMenu = (event: MouseEvent): void => {
        if (event.ctrlKey) event.preventDefault();
    };

    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerEnd, true);
    window.addEventListener("pointercancel", onPointerEnd, true);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        window.removeEventListener("pointerdown", onPointerDown, true);
        window.removeEventListener("pointermove", onPointerMove, true);
        window.removeEventListener("pointerup", onPointerEnd, true);
        window.removeEventListener("pointercancel", onPointerEnd, true);
        canvas.removeEventListener("contextmenu", onContextMenu);
        ctrlPanPointerId = null;
        detachLibraryControls();
    };
}
