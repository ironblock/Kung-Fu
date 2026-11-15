import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Orbit camera controls with Ctrl + primary-button drag panning, for Mac
// laptops without a right button.
//
// The library's own controls handle everything else: primary drag orbits,
// right drag pans, wheel and pinch zoom. Ctrl + primary is refused by the
// library (shouldHandlePointerDown) and handled here by feeding the same
// inertial panning fields the library's right-button pan writes to, so the
// glide and radius scaling come from the library's frame update.
//
// Sign convention for Y follows the library's pan: X is -dx / panningSensibility,
// Y is +dy / panningSensibility (see camera-notes.md item 9; the Y sign is not
// documented there and is an assumption).

function isCtrlPrimary(event: PointerEvent): boolean {
    return event.button === 0 && event.ctrlKey;
}

export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event: PointerEvent) => !isCtrlPrimary(event),
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

    const onPointerDown = (event: PointerEvent): void => {
        if (!isCtrlPrimary(event) || panPointerId !== null) {
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
        camera.inertialPanningX -= dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };

    const onPointerUp = (event: PointerEvent): void => {
        if (event.pointerId === panPointerId) {
            endPan();
        }
    };

    // Mac reports Ctrl + click as a context-menu event; keep the menu away from the canvas.
    const onContextMenu = (event: MouseEvent): void => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("lostpointercapture", onPointerUp);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        detachLibraryControls();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("lostpointercapture", onPointerUp);
        canvas.removeEventListener("contextmenu", onContextMenu);
        endPan();
    };
}
