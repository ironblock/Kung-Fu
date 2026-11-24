import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera by (pixels / angularSensibility) radians. Halving the
// sensibility on both axes doubles the turn for the same mouse or touch movement.
// The glide after release is built from the same input, so it scales too.
// Wheel and pinch zoom use their own precision settings and are not touched.
const DRAG_SPEEDUP = 2;

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // The scene is part of the agreed signature; the controls need only the camera and canvas.
    void scene;

    const baseX = camera.angularSensibilityX;
    const baseY = camera.angularSensibilityY;
    if (typeof baseX !== "number" || typeof baseY !== "number") {
        throw new Error("attachFastOrbit: camera has no numeric angularSensibilityX/Y to scale");
    }

    camera.angularSensibilityX = baseX / DRAG_SPEEDUP;
    camera.angularSensibilityY = baseY / DRAG_SPEEDUP;
    camera.attachControl(canvas);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        camera.detachControl();
        camera.angularSensibilityX = baseX;
        camera.angularSensibilityY = baseY;
    };
}
