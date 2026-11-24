import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Library orbit/pan/zoom controls, with Ctrl + primary-button drag panning
 * instead of orbiting (for Mac users without a right button).
 *
 * The library picks pan vs. orbit from the button alone, so a Ctrl + primary
 * press is rewritten to look like a secondary-button press (button 2) before the
 * camera's own canvas listeners see it. The camera then runs its normal pan path,
 * so pan speed, inertia and glide match a right-button drag exactly.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // pointerId of the drag currently being treated as a Ctrl-pan, or null.
    let panPointerId: number | null = null;

    // Rewrite the event's button/buttons as the camera reads them. The DOM
    // getters live on the prototype, so an own property shadows them.
    const relabel = (e: PointerEvent, button: number, buttons: number): void => {
        Object.defineProperty(e, "button", { value: button, configurable: true });
        Object.defineProperty(e, "buttons", { value: buttons, configurable: true });
    };

    // Capture-phase listeners on the canvas run before the camera's own
    // listeners, so they can relabel the event first.
    const onPointerDown = (e: PointerEvent): void => {
        if (e.button === 0 && e.ctrlKey) {
            panPointerId = e.pointerId;
            relabel(e, 2, (e.buttons & ~1) | 2);
        } else {
            panPointerId = null;
        }
    };

    const onPointerMove = (e: PointerEvent): void => {
        if (panPointerId === null || e.pointerId !== panPointerId) {
            return;
        }
        if ((e.buttons & 1) === 0) {
            // Primary button already released (release happened off-canvas).
            panPointerId = null;
            return;
        }
        // Moves carry button -1 on a real right-drag, so only buttons changes.
        relabel(e, e.button, (e.buttons & ~1) | 2);
    };

    const onPointerEnd = (e: PointerEvent): void => {
        if (panPointerId === null || e.pointerId !== panPointerId) {
            return;
        }
        // Mirror a right-button release: button 2, with the primary bit cleared.
        relabel(e, 2, e.buttons & ~1);
        panPointerId = null;
    };

    // Catches releases that happen outside the canvas, which the canvas never sees.
    const onWindowPointerEnd = (e: PointerEvent): void => {
        if (e.pointerId === panPointerId) {
            panPointerId = null;
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown, { capture: true });
    canvas.addEventListener("pointermove", onPointerMove, { capture: true });
    canvas.addEventListener("pointerup", onPointerEnd, { capture: true });
    canvas.addEventListener("pointercancel", onPointerEnd, { capture: true });
    window.addEventListener("pointerup", onWindowPointerEnd);
    window.addEventListener("pointercancel", onWindowPointerEnd);

    // Default bindings: primary rotates, secondary pans. Stated explicitly
    // because the Ctrl redirect depends on button 2 meaning pan.
    const detachControl = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    return () => {
        detachControl();
        canvas.removeEventListener("pointerdown", onPointerDown, { capture: true });
        canvas.removeEventListener("pointermove", onPointerMove, { capture: true });
        canvas.removeEventListener("pointerup", onPointerEnd, { capture: true });
        canvas.removeEventListener("pointercancel", onPointerEnd, { capture: true });
        window.removeEventListener("pointerup", onWindowPointerEnd);
        window.removeEventListener("pointercancel", onWindowPointerEnd);
        panPointerId = null;
    };
}
