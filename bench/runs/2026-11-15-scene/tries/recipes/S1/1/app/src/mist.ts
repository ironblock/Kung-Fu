import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Linear distance fog for the harbour scene.
// Nothing is fogged nearer than 30 units from the camera; from 120 units on,
// everything is fully the fog colour (pale grey-blue).
//
// Call this before registerScene(scene). Fog set after registration writes the
// uniforms but the meshes' pipelines have no fog code. Use setFog rather than
// assigning scene.fog directly, which leaves the fog uniforms at zero.
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: 3, // linear (1 = exp, 2 = exp2, 3 = linear)
        start: 30,
        end: 120,
        density: 0,
        color: [0.75, 0.8, 0.88],
    });
}
