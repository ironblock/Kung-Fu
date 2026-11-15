import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Distance (in world units) that one wheel notch moves the camera with the
 * library's default controls, measured on the camera as it is at attach time.
 *
 * NOT VERIFIED: the library's wheel formula is not available in this workspace
 * (only the camera type declarations are). Replace the body with the formula
 * from the library's wheel handling before using this module.
 */
function defaultNotchDistance(_camera: ArcRotateCamera): number {
    throw new Error(
        "steady-zoom: defaultNotchDistance is not implemented. " +
            "Supply the library's default per-notch wheel distance for the camera.",
    );
}

/**
 * Gives the arc-rotate camera the library's usual mouse and touch controls
 * (drag to orbit, right-drag to pan, pinch to zoom) with wheel zoom replaced by
 * a fixed world-space distance per notch.
 *
 * Returns a function that removes all listeners added here and the library's controls.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Read the notch distance first so a failure leaves nothing attached.
    const notch = defaultNotchDistance(camera);

    // Library controls for drag, pan, and pinch. Its wheel zoom is suppressed below.
    const detachLibrary = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    const onWheel = (event: WheelEvent): void => {
        // Stop the library's wheel handler on this canvas from also zooming.
        // Capture-phase listeners on the target run before the library's, so this takes effect.
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.deltaY === 0) {
            return;
        }

        // Wheel up (negative deltaY) zooms in, which reduces the radius.
        const direction = event.deltaY < 0 ? -1 : 1;
        let radius = camera.radius + direction * notch;

        const lower = camera.lowerRadiusLimit ?? 0;
        const upper = camera.upperRadiusLimit ?? Infinity;
        radius = Math.min(Math.max(radius, lower), upper);
        // Never let the radius reach zero.
        camera.radius = Math.max(radius, Number.EPSILON);
    };

    canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        canvas.removeEventListener("wheel", onWheel, { capture: true });
        detachLibrary();
    };
}
