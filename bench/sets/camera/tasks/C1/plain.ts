import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library's wheel zoom is linear, as in Babylon.js (wheelDeltaPercentage is 0 there by default):
// a notch moves the camera by deltaY / (wheelPrecision * k) units whatever the radius. The default controls
// therefore already zoom by a fixed distance per notch, at the default precision.
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachControl(camera, canvas, scene);
}
