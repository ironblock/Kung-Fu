import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to `canvas`,
 * except that a drag turns the camera twice as far for the same movement.
 *
 * The library turns the camera by (pixels / angularSensibility) per drag, and the
 * glide after release is built from that same offset, so halving angularSensibility
 * doubles both the drag and the glide. Wheel zoom is not touched.
 *
 * Returns a function that removes the controls and restores angularSensibility.
 * Nothing else is added: no listeners of ours and no per-frame callbacks.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;

    // Set before attaching, in case the library reads the value when the controls are attached.
    camera.angularSensibility = originalSensibility / 2;
    const detachControls = camera.attachControl(canvas, scene);

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        try {
            detachControls();
        } finally {
            camera.angularSensibility = originalSensibility;
        }
    };
}
