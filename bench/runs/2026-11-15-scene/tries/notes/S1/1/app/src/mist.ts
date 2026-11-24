import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Linear distance fog for the harbour scene's morning mist.
// Nothing is fogged nearer than MIST_START units from the camera; from
// MIST_END units on, everything is fully the fog colour.
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    // setFog is the only entry point that writes the fog uniforms; assigning
    // scene.fog directly writes nothing until setFog has run once.
    // The config shape (mode/start/end/color) is assumed: FogConfig is not in
    // the provided declarations, so check these field names against it.
    setFog(scene, {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: MIST_COLOR,
    });
}
