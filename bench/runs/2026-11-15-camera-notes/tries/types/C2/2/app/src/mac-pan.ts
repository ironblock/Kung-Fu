import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Library-default orbit/pan/zoom controls, plus Ctrl + primary-button drag to pan.
 *
 * The library maps the primary button to orbit and the secondary button to pan,
 * and it has no modifier-key option. So a Ctrl + primary press is intercepted
 * before it reaches the canvas, and the same pointer sequence is re-dispatched
 * to the canvas as a secondary-button sequence. The library's own pan path then
 * handles it, so it matches a right-button drag, including inertia (glide).
 *
 * Wheel, pinch, touch and plain primary/secondary drags are untouched.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachControl = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    // pointerId of the pointer currently panning via Ctrl + primary, or null.
    let ctrlPanPointerId: number | null = null;

    // Re-dispatch a trusted pointer event as a secondary-button event on the canvas.
    // Dispatched events have isTrusted === false, which the listeners below use to skip them.
    const redispatch = (type: string, e: PointerEvent): void => {
        const releasing = type === "pointerup" || type === "pointercancel";
        const synthetic = new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: e.pointerId,
            pointerType: e.pointerType,
            isPrimary: e.isPrimary,
            width: e.width,
            height: e.height,
            pressure: e.pressure,
            clientX: e.clientX,
            clientY: e.clientY,
            screenX: e.screenX,
            screenY: e.screenY,
            movementX: e.movementX,
            movementY: e.movementY,
            button: type === "pointermove" ? -1 : 2,
            buttons: releasing ? 0 : 2,
            ctrlKey: false,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
        });
        canvas.dispatchEvent(synthetic);
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (!e.isTrusted || e.target !== canvas) return;
        if (e.button !== 0 || !e.ctrlKey) return;
        // Ctrl + primary never reaches the library as a primary (orbit) press.
        // A second Ctrl + primary press while one is active is swallowed.
        e.stopPropagation();
        if (ctrlPanPointerId !== null) return;
        ctrlPanPointerId = e.pointerId;
        redispatch("pointerdown", e);
    };

    const onPointerMove = (e: PointerEvent): void => {
        if (!e.isTrusted || ctrlPanPointerId === null || e.pointerId !== ctrlPanPointerId) return;
        e.stopPropagation();
        redispatch("pointermove", e);
    };

    const onPointerEnd = (e: PointerEvent): void => {
        if (!e.isTrusted || ctrlPanPointerId === null || e.pointerId !== ctrlPanPointerId) return;
        e.stopPropagation();
        ctrlPanPointerId = null;
        redispatch(e.type, e);
    };

    // Mac: Ctrl + click opens the context menu. Suppress it over the canvas.
    const onContextMenu = (e: MouseEvent): void => {
        if (e.isTrusted && e.target === canvas && e.ctrlKey) e.preventDefault();
    };

    // Capture phase on window runs before any canvas listener, so the interception is reliable.
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerEnd, true);
    window.addEventListener("pointercancel", onPointerEnd, true);
    window.addEventListener("contextmenu", onContextMenu, true);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        window.removeEventListener("pointerdown", onPointerDown, true);
        window.removeEventListener("pointermove", onPointerMove, true);
        window.removeEventListener("pointerup", onPointerEnd, true);
        window.removeEventListener("pointercancel", onPointerEnd, true);
        window.removeEventListener("contextmenu", onContextMenu, true);
        ctrlPanPointerId = null;
        detachControl();
    };
}
