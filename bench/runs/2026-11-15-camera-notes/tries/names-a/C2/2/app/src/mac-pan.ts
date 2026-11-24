import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const PRIMARY_BUTTON = 0;
const SECONDARY_BUTTON = 2;

/**
 * Attaches the library's standard orbit controls to `canvas`, and makes
 * Ctrl + primary-button drag pan the camera (for Mac trackpads/mice without a
 * right button).
 *
 * How it works: the library's own control is attached with primary = rotate and
 * secondary = pan. Ctrl + primary presses are rejected by
 * `shouldHandlePointerDown`, and a secondary-button pointerdown is re-dispatched
 * to the canvas with the same pointer id and coordinates, followed by a matching
 * pointerup when the drag ends. The library therefore runs its normal
 * right-button pan code, so sensitivity, inertia (glide) and limits match a
 * right-button drag. Wheel, pinch and everything else is handled by the single
 * library attachment and is untouched.
 *
 * Returns a function that removes every listener and the library controls.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Pointer id of the Ctrl + primary drag currently being panned, or null.
    let ctrlPanPointerId: number | null = null;

    const detachControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event: PointerEvent) =>
            !(event.button === PRIMARY_BUTTON && event.ctrlKey),
    });

    const dispatchSecondaryPointer = (
        type: "pointerdown" | "pointerup",
        source: Pick<PointerEvent, "pointerId" | "pointerType" | "isPrimary" | "clientX" | "clientY" | "screenX" | "screenY" | "shiftKey" | "altKey" | "metaKey">,
    ) => {
        canvas.dispatchEvent(
            new PointerEvent(type, {
                pointerId: source.pointerId,
                pointerType: source.pointerType,
                isPrimary: source.isPrimary,
                button: SECONDARY_BUTTON,
                buttons: type === "pointerdown" ? SECONDARY_BUTTON : 0,
                clientX: source.clientX,
                clientY: source.clientY,
                screenX: source.screenX,
                screenY: source.screenY,
                ctrlKey: false,
                shiftKey: source.shiftKey,
                altKey: source.altKey,
                metaKey: source.metaKey,
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window,
            }),
        );
    };

    const onCanvasPointerDown = (event: PointerEvent) => {
        if (event.button !== PRIMARY_BUTTON || !event.ctrlKey) {
            return;
        }
        // The library ignores this press (see shouldHandlePointerDown). Start a
        // pan by giving it the secondary-button press it does handle.
        ctrlPanPointerId = event.pointerId;
        dispatchSecondaryPointer("pointerdown", event);
    };

    const onWindowPointerUp = (event: PointerEvent) => {
        if (ctrlPanPointerId === null || event.pointerId !== ctrlPanPointerId) {
            return;
        }
        ctrlPanPointerId = null;
        dispatchSecondaryPointer("pointerup", event);
    };

    // On macOS, Ctrl + click opens the context menu. Suppress it only during a Ctrl pan.
    const onCanvasContextMenu = (event: Event) => {
        if (ctrlPanPointerId !== null) {
            event.preventDefault();
        }
    };

    canvas.addEventListener("pointerdown", onCanvasPointerDown, true);
    canvas.addEventListener("contextmenu", onCanvasContextMenu, true);
    window.addEventListener("pointerup", onWindowPointerUp, true);
    window.addEventListener("pointercancel", onWindowPointerUp, true);

    return () => {
        window.removeEventListener("pointercancel", onWindowPointerUp, true);
        window.removeEventListener("pointerup", onWindowPointerUp, true);
        canvas.removeEventListener("contextmenu", onCanvasContextMenu, true);
        canvas.removeEventListener("pointerdown", onCanvasPointerDown, true);
        if (ctrlPanPointerId !== null) {
            // End a pan still in progress so the library is not left mid-drag.
            const pointerId = ctrlPanPointerId;
            ctrlPanPointerId = null;
            dispatchSecondaryPointer("pointerup", {
                pointerId,
                pointerType: "mouse",
                isPrimary: true,
                clientX: 0,
                clientY: 0,
                screenX: 0,
                screenY: 0,
                shiftKey: false,
                altKey: false,
                metaKey: false,
            });
        }
        detachControls();
    };
}
