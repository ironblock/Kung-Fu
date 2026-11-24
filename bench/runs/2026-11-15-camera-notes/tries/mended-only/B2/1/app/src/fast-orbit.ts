import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard mouse and touch orbit controls to `camera`,
 * with drag rotation at twice the library's default speed. Wheel zoom and
 * pinch zoom are left as the library does them.
 *
 * The speed change is made by halving the camera's angular sensitivity (the
 * divisor applied to drag pixels) before the controls are attached, so the
 * glide after release is doubled along with the drag.
 *
 * Returns a function that removes the controls (no canvas listeners remain and
 * nothing runs per frame) and restores the original sensitivity.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensitivity = camera.angularSensitivity;
    if (typeof defaultSensitivity !== "number" || !(defaultSensitivity > 0)) {
        throw new Error("attachFastOrbit: camera.angularSensitivity is not a positive number");
    }

    camera.angularSensitivity = defaultSensitivity / 2;
    const detachControls = camera.attachControl(canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        camera.angularSensitivity = defaultSensitivity;
    };
}
