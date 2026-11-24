import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Library controls with one change: a primary-button press while Ctrl is held
// pans instead of orbiting. The library's own attachControl is used for
// everything else (right-drag pan, primary-drag orbit, wheel, pinch), so its
// behaviour is unchanged. Ctrl+primary is refused by the library and handled
// here by adding to the same panning offsets the library's pan drag uses, so
// the per-frame glide (panningInertia) is the library's own.
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const isCtrlPrimary = (e: PointerEvent): boolean => e.button === 0 && e.ctrlKey;

    const detachLibrary = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (e) => !isCtrlPrimary(e),
    });

    let activePointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent): void => {
        if (activePointerId !== null || !isCtrlPrimary(e)) return;
        activePointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
    };

    // Window-level so the drag keeps going when the pointer leaves the canvas.
    const onPointerMove = (e: PointerEvent): void => {
        if (e.pointerId !== activePointerId) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        // Same terms as the library's pan drag (right button): see camera-notes.md item 20.
        camera.inertialPanningX += -dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };

    const onPointerUp = (e: PointerEvent): void => {
        if (e.pointerId === activePointerId) activePointerId = null;
    };

    // On macOS, Ctrl+click opens the context menu; suppress it only for Ctrl presses.
    const onContextMenu = (e: MouseEvent): void => {
        if (e.ctrlKey) e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
        detachLibrary();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        activePointerId = null;
    };
}
