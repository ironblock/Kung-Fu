import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Linear distance fog for a light morning mist: no fog nearer than 30 units,
// fully the fog colour from 120 units out.
// setFog must be called (not just assigning scene.fog) so the fog uniforms
// are written to the shaders.
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
