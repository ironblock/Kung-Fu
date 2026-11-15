import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's orbit controls to `canvas` and adds Ctrl + primary-button
 * drag as a pan, for Mac trackpads and mice with no right button.
 *
 * - Ctrl + primary drag (mouse only) never reaches the library's handlers, so it does
 *   not orbit (the library rotates on Ctrl+left, see notes 39).
 * - Each move adds the same offsets a right-button drag adds (notes 14):
 *   inertialPanningX -= dx / panningSensibility, and the library's per-frame step
 *   applies them, glide included.
 * - Everything else (primary drag, right drag, wheel, pinch, touch) stays with the library.
 *
 * The returned function removes every listener this module added, and the library's
 * controls. This module adds nothing that runs per frame.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    let pan: { pointerId: number; lastX: number; lastY: number } | null = null;

    // Ctrl + primary button, from a mouse or pen (touch always rotates in the library).
    const isCtrlPrimary = (e: MouseEvent): boolean => {
        if (e.target !== canvas || e.button !== 0 || !e.ctrlKey) {
            return false;
        }
        return (e as Partial<PointerEvent>).pointerType !== "touch";
    };

    // Stops the event before it reaches the canvas, where the library listens.
    // Listeners are on window in the capture phase, so they run first.
    const block = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const endPan = () => {
        pan = null;
    };

    const onPointerDown = (e: PointerEvent) => {
        if (!isCtrlPrimary(e)) {
            return;
        }
        block(e);
        pan = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    };

    const onMouseDown = (e: MouseEvent) => {
        if (isCtrlPrimary(e)) {
            block(e);
        }
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!pan || e.pointerId !== pan.pointerId) {
            return;
        }
        // The button was released where we could not see it: stop panning.
        if ((e.buttons & 1) === 0) {
            endPan();
            return;
        }
        const dx = e.clientX - pan.lastX;
        const dy = e.clientY - pan.lastY;
        pan.lastX = e.clientX;
        pan.lastY = e.clientY;
        camera.inertialPanningX -= dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };

    const onPointerEnd = (e: PointerEvent) => {
        if (pan && e.pointerId === pan.pointerId) {
            endPan();
        }
    };

    // On macOS, Ctrl + click opens the context menu; keep it off the canvas.
    const onContextMenu = (e: MouseEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    };

    // Register the capture listeners before the library's, so they run first.
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    window.addEventListener("blur", endPan);
    canvas.addEventListener("contextmenu", onContextMenu);

    const detachOrbit = camera.attachControl(canvas, scene);

    return () => {
        detachOrbit();
        window.removeEventListener("pointerdown", onPointerDown, true);
        window.removeEventListener("mousedown", onMouseDown, true);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerEnd);
        window.removeEventListener("pointercancel", onPointerEnd);
        window.removeEventListener("blur", endPan);
        canvas.removeEventListener("contextmenu", onContextMenu);
        endPan();
    };
}
