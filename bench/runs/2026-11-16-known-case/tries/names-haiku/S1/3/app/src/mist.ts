import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Linear distance fog for the harbour mist: no fog nearer than 30 units,
// fully fogged at 120 units and beyond, in a pale grey-blue.
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
