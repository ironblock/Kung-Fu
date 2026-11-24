import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Linear distance fog: no fog nearer than 30 units, fully fog-coloured from 120 units.
// Colour is a pale grey-blue (r 0.75, g 0.8, b 0.88).
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
