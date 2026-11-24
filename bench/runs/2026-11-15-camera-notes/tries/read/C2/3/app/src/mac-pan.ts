import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Direction of the pan that a right-button drag produces in the library.
// Taken from the upstream Babylon.js pointer input (inertialPanningX -= dx / s,
// inertialPanningY += dy / s). Not checked against Babylon Lite 1.39.0 itself.
const PAN_SIGN_X = -1;
const PAN_SIGN_Y = 1;

function isCtrlPrimary(event: PointerEvent): boolean {
    return event.button === 0 && event.ctrlKey;
}

/**
 * Orbit controls with the library's defaults, plus Ctrl + primary-button drag to pan.
 * A Ctrl-drag adds the same inertial panning as a right-button drag of the same
 * movement, so it glides and decays with the camera's panningInertia.
 * The returned function removes every listener this attaches.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // The library ignores Ctrl + primary presses, so they cannot orbit.
    // Touch and plain primary presses still go to the library's own rotate.
    const detachLibrary = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event) => !isCtrlPrimary(event),
    });

    let panPointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent): void => {
        if (!isCtrlPrimary(event)) {
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
        camera.inertialPanningX += (PAN_SIGN_X * dx) / camera.panningSensibility;
        camera.inertialPanningY += (PAN_SIGN_Y * dy) / camera.panningSensibility;
    };

    const onPointerEnd = (event: PointerEvent): void => {
        if (event.pointerId !== panPointerId) {
            return;
        }
        panPointerId = null;
        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
    };

    // macOS can open the context menu on Ctrl + click; keep it closed for Ctrl presses.
    const onContextMenu = (event: MouseEvent): void => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
    canvas.addEventListener("contextmenu", onContextMenu);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerEnd);
        canvas.removeEventListener("pointercancel", onPointerEnd);
        canvas.removeEventListener("contextmenu", onContextMenu);
        if (panPointerId !== null && canvas.hasPointerCapture(panPointerId)) {
            canvas.releasePointerCapture(panPointerId);
        }
        panPointerId = null;
        detachLibrary();
    };
}
