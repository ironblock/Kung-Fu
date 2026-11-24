import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A primary-button mouse press with Ctrl held. The library's own handler
// would orbit for this press (its Ctrl+primary behaviour is rotate), so we
// keep the library from starting a drag for it and pan ourselves instead.
function isCtrlPrimaryPress(e: PointerEvent): boolean {
    return e.button === 0 && e.ctrlKey && e.pointerType !== "touch";
}

/**
 * Attaches the library's orbit-camera controls to `canvas`, with one addition:
 * Ctrl + primary-button drag pans the camera instead of orbiting it.
 *
 * Pan goes through the camera's own inertial panning fields, the same ones a
 * right-button drag writes, so the per-frame movement and glide are the
 * library's. Returns a function that removes every listener and stops the
 * controls.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Library controls: primary drag orbits, secondary drag pans, wheel and
    // pinch zoom, touch rotates. Ctrl+primary presses are refused here so the
    // library does not orbit for them.
    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (e) => !isCtrlPrimaryPress(e),
    });

    let panPointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const endPan = (): void => {
        if (panPointerId !== null && canvas.hasPointerCapture(panPointerId)) {
            canvas.releasePointerCapture(panPointerId);
        }
        panPointerId = null;
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (panPointerId !== null || !isCtrlPrimaryPress(e)) return;
        panPointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent): void => {
        if (e.pointerId !== panPointerId) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        // Same mapping the library uses for a secondary-button drag.
        camera.inertialPanningX -= dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };

    const onPointerEnd = (e: PointerEvent): void => {
        if (e.pointerId === panPointerId) endPan();
    };

    // On macOS, Ctrl+click opens the context menu; suppress it on the canvas.
    const onContextMenu = (e: MouseEvent): void => {
        if (e.ctrlKey) e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
    canvas.addEventListener("lostpointercapture", onPointerEnd);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerEnd);
        canvas.removeEventListener("pointercancel", onPointerEnd);
        canvas.removeEventListener("lostpointercapture", onPointerEnd);
        canvas.removeEventListener("contextmenu", onContextMenu);
        endPan();
        detachLibraryControls();
    };
}
