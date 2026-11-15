import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Taken from setFog itself so this file does not depend on FogConfig being
// re-exported from the package root.
type FogConfig = Parameters<typeof setFog>[1];

/**
 * Light morning mist over the harbour: linear distance fog that starts at 30
 * units from the camera and is fully the fog colour (pale grey-blue) from
 * 120 units on.
 *
 * Call this BEFORE registerScene / registerSceneWithShadowSupport. Standard
 * meshes built without fog keep fog-free shaders after a later setFog until
 * `await rebuildSceneRenderables(scene)`.
 *
 * Fog has to go through setFog: a plain `scene.fog = ...` assignment never
 * reaches the shaders. Editing the uploaded object in place
 * (`scene.fog.start = ...`) is not uploaded either, so every call builds a new
 * config object and nothing keeps a reference to it.
 */
export function addMist(scene: SceneContext): void {
    const mist: FogConfig = {
        mode: "linear",
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    };
    setFog(scene, mist);
}
