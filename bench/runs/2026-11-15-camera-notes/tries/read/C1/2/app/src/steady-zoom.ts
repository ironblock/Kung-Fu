import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's default orbit controls to `canvas`, but makes each
 * wheel notch move the camera by a fixed distance: the one the default
 * controls would give on the camera as it is when this function is called.
 *
 * The library's wheel step is `deltaY * radius / (wheelPrecision * 1000)`,
 * which scales with the radius at the time of the event. For each wheel event
 * that reaches the canvas we scale `wheelPrecision` by `radius / baseRadius`
 * just for the duration of that event, so the step becomes
 * `deltaY * baseRadius / (baseWheelPrecision * 1000)`, independent of where
 * the camera has moved since. The original value is restored once the event
 * has finished bubbling. Pinch, drag and pan are left to the library.
 *
 * The returned function removes every listener this installs.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseRadius = camera.radius;
    const baseWheelPrecision = camera.wheelPrecision;
    const win: Window = canvas.ownerDocument.defaultView ?? window;

    // Value of camera.wheelPrecision that we replaced for the current event, if any.
    let savedWheelPrecision: number | null = null;

    const restoreWheelPrecision = (): void => {
        if (savedWheelPrecision !== null) {
            camera.wheelPrecision = savedWheelPrecision;
            savedWheelPrecision = null;
        }
    };

    // Window capture listeners run before any listener on the canvas, so the
    // library's wheel handler sees the adjusted precision.
    const onWheelCapture = (event: WheelEvent): void => {
        // Clear anything left over from an event whose bubbling was stopped.
        restoreWheelPrecision();

        if (!event.composedPath().includes(canvas)) {
            return;
        }
        const radius = camera.radius;
        if (!(radius > 0) || !Number.isFinite(radius) || !(baseRadius > 0) || !(baseWheelPrecision > 0)) {
            // A zero radius gives a zero step anyway; avoid dividing by it.
            return;
        }
        savedWheelPrecision = camera.wheelPrecision;
        camera.wheelPrecision = (baseWheelPrecision * radius) / baseRadius;
    };

    // Window bubble listeners run after the canvas listeners have handled the event.
    const onWheelBubble = (): void => {
        restoreWheelPrecision();
    };

    win.addEventListener("wheel", onWheelCapture, { capture: true });
    win.addEventListener("wheel", onWheelBubble, { capture: false });

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        win.removeEventListener("wheel", onWheelCapture, { capture: true });
        win.removeEventListener("wheel", onWheelBubble, { capture: false });
        restoreWheelPrecision();
        detachControls();
    };
}
