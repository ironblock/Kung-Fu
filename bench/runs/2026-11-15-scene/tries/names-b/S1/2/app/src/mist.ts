import type { SceneContext } from "@babylonjs/lite";
// setFog is declared in scene/scene-ubo-extras.d.ts. Its re-export from the
// package root is NOT confirmed by the declarations provided.
import { setFog } from "@babylonjs/lite";

// Fog parameters for a light morning mist: linear distance fog.
// Nothing is fogged nearer than MIST_START units from the camera; from
// MIST_END units on, everything is fully the fog colour.
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    // NOTE: the FogConfig field names below (mode/start/end/color) are NOT
    // verified against the library; FogConfig's definition was not available.
    // Check them against material/standard/standard-material's FogConfig.
    setFog(scene, {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: MIST_COLOR,
    });
}
