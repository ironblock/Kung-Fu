import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls to `camera` on `canvas`, with
 * drag rotation sped up 2x.
 *
 * Approach: the standard pointer input turns the camera by
 * (pixel movement / angularSensibility), and the post-release glide is built
 * from the same deltas. Halving both angular sensibilities therefore doubles
 * the drag turn and the glide, without any per-frame hook. Wheel zoom uses
 * separate settings and is left untouched.
 *
 * The returned function detaches the controls and restores the original
 * sensibilities.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    void scene;

    const originalX = camera.angularSensibilityX;
    const originalY = camera.angularSensibilityY;

    // Lower sensibility value means more rotation per pixel, so halve it for 2x.
    camera.angularSensibilityX = originalX / 2;
    camera.angularSensibilityY = originalY / 2;

    camera.attachControl(canvas, true);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        camera.detachControl();
        camera.angularSensibilityX = originalX;
        camera.angularSensibilityY = originalY;
    };
}
