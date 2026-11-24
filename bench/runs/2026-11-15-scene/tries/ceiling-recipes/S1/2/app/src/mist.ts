import { rebuildSceneRenderables, setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/** Fog modes understood by the standard materials' shaders. */
const FOG_MODE_LINEAR = 3;

/**
 * Gives the scene a light morning mist: linear distance fog that starts at
 * 30 units from the camera and is fully the fog colour (a pale grey-blue)
 * from 120 units on.
 *
 * Safe to call before or after the scene has been registered.
 */
export function addMist(scene: SceneContext): void {
    // setFog (not a plain `scene.fog = ...`) so the fog uniforms are actually
    // written. A fresh object and colour array on every call, so later in-place
    // edits on one scene can never leak into another.
    setFog(scene, {
        mode: FOG_MODE_LINEAR,
        density: 0, // unused by linear fog
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });

    // Fog is compiled into the shaders when the scene is registered. If that
    // has already happened, the existing shaders were built without fog, so
    // rebuild them to pick it up.
    if (scene._built) {
        rebuildSceneRenderables(scene).catch((error: unknown) => {
            console.error("addMist: failed to rebuild scene renderables for fog", error);
        });
    }
}
