import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// How many times farther a drag turns the camera than the library default.
const DRAG_TURN_FACTOR = 2;

/**
 * Attaches the library's standard orbit controls (mouse and touch rotate, wheel zoom)
 * with drag rotation scaled up. The library turns the camera by pointer movement
 * divided by `angularSensibility`, and the glide after release is the same offset
 * decayed by `inertia`, so dividing `angularSensibility` by 2 scales both the drag
 * and the glide. Wheel zoom and pan use other fields and are unchanged.
 *
 * The returned function detaches the controls and restores `angularSensibility`.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultAngularSensibility = camera.angularSensibility;

    // Set before attaching, so it applies whether the library reads the value
    // once at attach time or on every pointer event.
    camera.angularSensibility = defaultAngularSensibility / DRAG_TURN_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        camera.angularSensibility = defaultAngularSensibility;
    };
}
