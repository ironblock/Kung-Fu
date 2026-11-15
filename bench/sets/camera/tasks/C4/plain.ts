import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Like Babylon.js's interpolateTo: give the goal alpha and let the transition ease the camera there.
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    return interpolateArcRotateCamera(camera, scene, { alpha: camera.alpha + 2 * Math.PI * turns });
}
