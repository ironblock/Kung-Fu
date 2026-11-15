import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Library controls with wheel zoom that moves a fixed distance per notch.
 *
 * The library's wheel handler adds deltaY * radius / (wheelPrecision * 1000) to
 * inertialRadiusOffset, so a notch's size depends on the radius at the time of the
 * event. Here the wheel is taken over: each notch adds an offset sized from the
 * radius and wheelPrecision captured when this function is called, corrected for
 * the current inertia so the total travel matches what the default controls gave
 * at call time (offset / (1 - inertia) in total).
 *
 * Drag, right-drag pan, and pinch are left to the library's attachControl.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Values as they are now, i.e. the defaults the notch distance is measured against.
    const unit0 = camera.radius / (camera.wheelPrecision * 1000);
    const inertia0 = camera.inertia;

    const wheelOptions: AddEventListenerOptions = { capture: true, passive: false };

    const onWheel = (event: WheelEvent): void => {
        // Capture phase on the canvas, registered before attachControl, so this runs
        // first and stops the library's own wheel handler from running for this event.
        event.preventDefault();
        event.stopImmediatePropagation();

        // Total travel of an offset x is x / (1 - inertia). Pick x so the total is
        // deltaY * unit0 / (1 - inertia0), whatever the inertia is now.
        const inertia = camera.inertia;
        const correction = inertia < 1 && inertia0 < 1 ? (1 - inertia) / (1 - inertia0) : 1;
        camera.inertialRadiusOffset += event.deltaY * unit0 * correction;
    };

    canvas.addEventListener("wheel", onWheel, wheelOptions);

    let detachControl: () => void;
    try {
        detachControl = attachControl(camera, canvas, scene, {
            pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        });
    } catch (error) {
        canvas.removeEventListener("wheel", onWheel, wheelOptions);
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        canvas.removeEventListener("wheel", onWheel, wheelOptions);
        detachControl();
    };
}
