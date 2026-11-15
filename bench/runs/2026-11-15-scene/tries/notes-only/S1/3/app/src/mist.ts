import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Linear distance fog for the harbour scene: no fog nearer than 30 units,
// fully fogged at 120 units and beyond, in a pale grey-blue.
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    // Per the library notes, the fog uniforms are only written after a first
    // setFog(scene, config), so call it before assigning scene.fog.
    setFog(scene, {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: MIST_COLOR,
    });

    // A new fog object is written to the shaders immediately, whereas an
    // in-place edit would wait for the next camera or aspect change.
    scene.fog = {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: [...MIST_COLOR] as [number, number, number],
    };
}
