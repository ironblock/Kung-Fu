import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Library orbit controls on a canvas, plus Ctrl + primary-button drag to pan.
 *
 * The library's own controls handle everything (primary drag orbits, right drag
 * pans, wheel and pinch zoom, touch). Only a primary-button press with Ctrl held
 * is refused by the library (via shouldHandlePointerDown); for those presses we
 * feed the camera's pan offsets directly, so the library's per-frame pan and its
 * panningInertia glide apply exactly as they do for a right-button drag.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let drag: { pointerId: number; x: number; y: number } | null = null;

    const isCtrlPrimary = (e: PointerEvent): boolean => e.button === 0 && e.ctrlKey;

    const detachLibrary = attachControl(camera, canvas, scene, {
        shouldHandlePointerDown: (e: PointerEvent) => !isCtrlPrimary(e),
    });

    const endDrag = (): void => {
        drag = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerEnd);
        window.removeEventListener("pointercancel", onPointerEnd);
    };

    const onPointerMove = (e: PointerEvent): void => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        // Sign convention assumed to match the library's pan input; see note in reply.
        camera.inertialPanningX -= dx;
        camera.inertialPanningY += dy;
    };

    const onPointerEnd = (e: PointerEvent): void => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endDrag();
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (!isCtrlPrimary(e) || drag) return;
        drag = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerEnd);
        window.addEventListener("pointercancel", onPointerEnd);
    };

    // macOS raises a context menu on Ctrl+click; suppress it so Ctrl-drag is usable.
    const onContextMenu = (e: MouseEvent): void => {
        if (e.ctrlKey) e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        detachLibrary();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("contextmenu", onContextMenu);
        endDrag();
    };
}
