import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Linear distance fog for the harbour scene: nothing is fogged nearer than
// 30 units from the camera, and from 120 units on everything is fully the
// fog colour (a pale grey-blue).
//
// Call this before `registerScene(scene)`. Fog set after registration writes
// the uniforms but the meshes' pipelines have no fog code, so the mist would
// not appear. The scene also needs a camera, or the scene uniforms (including
// fog) are never written.
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: 3, // linear
        start: 30,
        end: 120,
        density: 0,
        color: [0.75, 0.8, 0.88],
    });
}
