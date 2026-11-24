import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const PRIMARY_BUTTON = 0;

// Ctrl + primary-button drag pans the camera. The library's own Ctrl+primary
// drag still orbits (camera-notes.md, note 39), so the library is told to
// ignore that pointer-down and this module pans instead, feeding the same
// inertialPanningX/Y fields that the library's right-button pan uses. The
// library's per-frame step then applies the pan, glide included.
//
// Only canvas listeners are added here, and there is no per-frame hook, so
// nothing runs each frame on our side.
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const isCtrlPrimary = (event: PointerEvent): boolean =>
        event.button === PRIMARY_BUTTON && event.ctrlKey && event.pointerType !== "touch";

    const detachLibrary = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event: PointerEvent) => !isCtrlPrimary(event),
    });

    let panPointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent): void => {
        if (panPointerId !== null || !isCtrlPrimary(event)) {
            return;
        }
        panPointerId = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent): void => {
        if (event.pointerId !== panPointerId) {
            return;
        }
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        // Same scale as the library's right-button pan: dx gives -dx / panningSensibility
        // (camera-notes.md, note 14). The Y sign mirrors that grab-style convention.
        camera.inertialPanningX -= dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };

    const endPan = (event: PointerEvent): void => {
        if (event.pointerId !== panPointerId) {
            return;
        }
        panPointerId = null;
        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
    };

    // On macOS, Ctrl+click opens a context menu. Suppress it while a Ctrl-pan is in progress.
    const onContextMenu = (event: MouseEvent): void => {
        if (panPointerId !== null) {
            event.preventDefault();
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endPan);
    canvas.addEventListener("pointercancel", endPan);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", endPan);
        canvas.removeEventListener("pointercancel", endPan);
        canvas.removeEventListener("contextmenu", onContextMenu);
        if (panPointerId !== null && canvas.hasPointerCapture(panPointerId)) {
            canvas.releasePointerCapture(panPointerId);
        }
        panPointerId = null;
        detachLibrary();
    };
}
