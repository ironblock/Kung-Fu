import type { SceneContext } from "@babylonjs/lite";

// Linear distance fog for the harbour scene's morning mist.
// Nothing is fogged nearer than 30 units from the camera; from 120 units on,
// everything is fully the fog colour (pale grey-blue).
//
// NOTE: the FogConfig field names below (mode, start, end, color) are NOT
// verified against the library. FogConfig is declared in
// material/standard/standard-material.d.ts, which is not in this project.
// Check them against that file before relying on this.
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    scene.fog = {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: MIST_COLOR,
    } as NonNullable<SceneContext["fog"]>;
}
