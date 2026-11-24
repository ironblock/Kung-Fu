import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Pale grey-blue morning mist: linear distance fog.
// Nothing is fogged nearer than 30 units from the camera; at 120 units and
// beyond everything is fully the fog colour.
//
// Call this before registerScene(scene). Fog set after registration writes
// the uniforms but the mesh pipelines have no fog code, so it has no effect.
const MIST_MODE_LINEAR = 3;
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: MIST_MODE_LINEAR,
        start: MIST_START,
        end: MIST_END,
        density: 0,
        color: MIST_COLOR,
    });
}
