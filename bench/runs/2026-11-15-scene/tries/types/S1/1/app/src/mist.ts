import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/**
 * Adds a light morning mist to the scene: linear distance fog that is off
 * within 30 units of the camera and fully the fog colour from 120 units out.
 */
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        density: 0,
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
