import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Linear distance fog for the harbour scene's morning mist.
// Call before registerScene: Standard meshes built without fog keep
// fog-free shaders after a later setFog (until rebuildSceneRenderables).
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        start: 30,
        end: 120,
        color: { r: 0.75, g: 0.8, b: 0.88 },
    });
}
