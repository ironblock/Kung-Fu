import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's default arc-rotate controls to `camera` on `canvas`
 * (primary-drag orbit, right-drag pan, wheel and pinch zoom, with the library's
 * inertia) and adds Ctrl + primary-button drag as a second way to pan, for Mac
 * laptops without a right button.
 *
 * The library is told to ignore Ctrl + primary presses, so they never orbit.
 * While such a drag is held, each pointer move adds to the camera's inertial
 * panning offsets the same per-pixel amount a right-button drag adds (Babylon's
 * ArcRotateCameraPointersInput formula, which `attachControl` follows). The
 * library's own per-frame loop then applies and decays those offsets, so the pan
 * and its glide match a right-button drag, and nothing of ours runs per frame.
 *
 * Whether a drag pans is decided when the button goes down: pressing or releasing
 * Ctrl in the middle of a drag does not switch it between orbit and pan.
 *
 * @returns A function that removes all of these controls. Safe to call more than once.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    /** Pointer driving the current Ctrl-drag pan, or null when none is in progress. */
    let panPointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const detachLibraryControls = attachControl(camera, canvas, scene, {
        shouldHandlePointerDown: (event) => !isCtrlPrimaryPress(event),
    });

    const endPan = (): void => {
        if (panPointerId === null) return;
        const pointerId = panPointerId;
        panPointerId = null;
        if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    };

    const onPointerDown = (event: PointerEvent): void => {
        if (panPointerId !== null || !isCtrlPrimaryPress(event)) return;
        panPointerId = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;
        event.preventDefault();
        try {
            // Keeps the drag going when the pointer leaves the canvas.
            canvas.setPointerCapture(event.pointerId);
        } catch {
            // Capture is best-effort; panning over the canvas works without it.
        }
    };

    const onPointerMove = (event: PointerEvent): void => {
        if (event.pointerId !== panPointerId) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        const sensibility = camera.panningSensibility;
        if (sensibility === 0) return; // panning disabled
        camera.inertialPanningX += -dx / sensibility;
        camera.inertialPanningY += dy / sensibility;
    };

    const onPointerEnd = (event: PointerEvent): void => {
        if (event.pointerId === panPointerId) endPan();
    };

    // macOS treats Ctrl+click as a context-menu click; a menu opening would swallow the drag.
    const onContextMenu = (event: MouseEvent): void => {
        if (panPointerId !== null) event.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
    canvas.addEventListener("lostpointercapture", onPointerEnd);
    canvas.addEventListener("contextmenu", onContextMenu);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        endPan();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerEnd);
        canvas.removeEventListener("pointercancel", onPointerEnd);
        canvas.removeEventListener("lostpointercapture", onPointerEnd);
        canvas.removeEventListener("contextmenu", onContextMenu);
        // Removes the library's canvas listeners and its per-frame inertia hook.
        detachLibraryControls();
    };
}

/** A mouse or pen press of the primary button with Ctrl held: pan instead of orbit. */
function isCtrlPrimaryPress(event: PointerEvent): boolean {
    return event.ctrlKey && event.button === 0 && event.pointerType !== "touch";
}
