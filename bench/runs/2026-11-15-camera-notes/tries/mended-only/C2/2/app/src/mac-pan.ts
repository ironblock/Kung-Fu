import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's orbit controls to the camera, and adds Ctrl+primary-drag panning.
 *
 * The library rotates on button 0 even with Ctrl held (notes item 19), so a Ctrl+primary
 * press is intercepted in the window capture phase before it reaches the canvas. The drag
 * is then turned into the same inertial pan offset that a right-button drag produces
 * (notes items 9 and 12), so the library's per-frame pan and glide apply unchanged.
 *
 * Everything else (orbit, right-drag pan, wheel, touch) is left to the library.
 * The returned function removes our listeners and calls the library's detach function.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detachLibrary = attachControl(camera, canvas, scene);

    let dragPointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const endDrag = (pointerId: number): void => {
        dragPointerId = null;
        try {
            canvas.releasePointerCapture(pointerId);
        } catch {
            // Capture may already be released; nothing to do.
        }
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (e.target !== canvas || e.button !== 0 || !e.ctrlKey) {
            return;
        }
        // Keep this press away from the library so it does not orbit.
        e.stopImmediatePropagation();
        e.preventDefault();
        dragPointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        try {
            canvas.setPointerCapture(e.pointerId);
        } catch {
            // Without capture, moves outside the canvas are not delivered; the drag still works inside it.
        }
    };

    const onPointerMove = (e: PointerEvent): void => {
        if (dragPointerId === null || e.pointerId !== dragPointerId) {
            return;
        }
        e.stopImmediatePropagation();
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        // Same mapping the library uses for a right-button pan drag.
        camera.inertialPanningX -= dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };

    const onPointerUp = (e: PointerEvent): void => {
        if (dragPointerId === null || e.pointerId !== dragPointerId) {
            return;
        }
        e.stopImmediatePropagation();
        endDrag(e.pointerId);
    };

    const onLostCapture = (e: PointerEvent): void => {
        if (dragPointerId !== null && e.pointerId === dragPointerId) {
            dragPointerId = null;
        }
    };

    // macOS fires contextmenu on Ctrl+click; suppress it so Ctrl+drag does not open a menu.
    const onContextMenu = (e: MouseEvent): void => {
        if (e.target === canvas && e.ctrlKey) {
            e.preventDefault();
        }
    };

    // Window capture phase runs before the canvas listeners, so stopImmediatePropagation
    // keeps these events away from the library's handlers.
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    canvas.addEventListener("lostpointercapture", onLostCapture);

    return () => {
        window.removeEventListener("pointerdown", onPointerDown, true);
        window.removeEventListener("pointermove", onPointerMove, true);
        window.removeEventListener("pointerup", onPointerUp, true);
        window.removeEventListener("pointercancel", onPointerUp, true);
        window.removeEventListener("contextmenu", onContextMenu, true);
        canvas.removeEventListener("lostpointercapture", onLostCapture);
        if (dragPointerId !== null) {
            endDrag(dragPointerId);
        }
        detachLibrary();
    };
}
