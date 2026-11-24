import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library's rotate drag adds dx / angularSensibility (and dy likewise) to the
// alpha and beta offsets, and the glide after release decays those same offsets.
// Halving angularSensibility therefore doubles both the drag and the glide.
// Pan, wheel zoom, pinch and keyboard use other fields and are left alone.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Attach the library's standard controls first, so a throw leaves the camera unchanged.
    const detach = attachControl(camera, canvas, scene);

    const defaultSensibility = camera.angularSensibility;
    const fastSensibility = defaultSensibility / 2;
    camera.angularSensibility = fastSensibility;

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detach();
        // Restore the original value unless the caller has changed it since.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = defaultSensibility;
        }
    };
}
