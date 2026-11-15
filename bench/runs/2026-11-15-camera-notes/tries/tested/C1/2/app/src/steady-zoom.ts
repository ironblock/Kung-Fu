import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's arc-rotate controls to `canvas`, but replaces its wheel
 * zoom with one whose step is a fixed distance per unit of wheel deltaY.
 *
 * The library's own wheel zoom subtracts `deltaY * radius / (wheelPrecision * 1000)`
 * from `inertialRadiusOffset`, so each notch moves the camera a distance that grows
 * with the current radius. Here the radius and wheelPrecision are read once, at call
 * time, and each wheel event adds the same distance the library would have added at
 * that radius. Drag-to-orbit, right-drag pan and touch pinch remain the library's.
 *
 * Returns a function that removes the wheel handler and the library's controls.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Distance per unit of deltaY, as the library's default would give at the
    // radius and wheelPrecision the camera has when this function is called.
    const distancePerDeltaY = camera.radius / (camera.wheelPrecision * 1000);

    const detachLibraryControls = attachControl(camera, canvas, scene);

    // The library's wheel listener sits on the canvas (or above it). A capture
    // listener on window runs before any of those, so stopping propagation here
    // keeps the library from also zooming on the same event.
    const onWheel = (event: WheelEvent): void => {
        if (!canvas.contains(event.target as Node | null)) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        camera.inertialRadiusOffset -= event.deltaY * distancePerDeltaY;
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachLibraryControls();
    };
}
