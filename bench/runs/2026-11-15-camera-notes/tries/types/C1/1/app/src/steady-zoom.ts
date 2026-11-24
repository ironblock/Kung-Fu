import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Size of the synthetic wheel event used to measure the library's default notch.
const PROBE_DELTA_Y = 100;

/**
 * Attach the library's orbit controls to `camera`, but make each wheel notch
 * move the camera a fixed distance (in radius units) toward or away from its
 * target. The distance is measured once, here, from the library's default
 * wheel response on the camera's state at call time, and does not change
 * afterwards.
 *
 * Drag-to-orbit, right-drag pan and pinch zoom are still the library's.
 *
 * @returns Removes every canvas listener this call added and the library's
 * per-frame inertia hook. Safe to call more than once.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detachLibrary = attachControl(camera, canvas, scene);

    // Measure one default notch: the library's wheel handler accumulates into
    // inertialRadiusOffset synchronously, so read the change and then restore it.
    // ASSUMPTION: that offset is in the same units as radius (absolute, not scaled
    // by radius). The declarations do not say so; see the notes in the summary.
    const offsetBefore = camera.inertialRadiusOffset;
    canvas.dispatchEvent(
        new WheelEvent("wheel", { deltaY: PROBE_DELTA_Y, deltaMode: 0, bubbles: true, cancelable: true }),
    );
    const notch = Math.abs(camera.inertialRadiusOffset - offsetBefore);
    camera.inertialRadiusOffset = offsetBefore;
    if (!Number.isFinite(notch) || notch <= 0) {
        detachLibrary();
        throw new Error("steady-zoom: could not measure the library's default wheel step");
    }

    // Installed after the probe, so the probe reached only the library's listener.
    // Capture on window so this runs before the canvas listeners; stopping
    // propagation there keeps the library's own wheel handler from zooming too.
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) return;
        event.stopPropagation();
        event.preventDefault();
        if (event.deltaY === 0) return;

        // Each wheel event is one notch regardless of its deltaY magnitude.
        // ASSUMPTION: deltaY > 0 (scroll down) zooms out, as in the usual convention.
        const direction = Math.sign(event.deltaY);
        const next = camera.radius + direction * notch;
        if (next > 0) camera.radius = next;
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachLibrary();
    };
}
