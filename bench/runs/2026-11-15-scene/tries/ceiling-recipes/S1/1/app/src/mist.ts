import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/** Fog mode for linear distance fog (1 = exp, 2 = exp2, 3 = linear). */
const FOG_MODE_LINEAR = 3;

/**
 * Gives the harbour scene a light morning mist: linear distance fog that
 * starts at 30 units from the camera and is solid pale grey-blue from 120 on.
 *
 * Call it before `registerScene` / `registerSceneWithShadowSupport`. If fog is
 * first set after registration, the uniforms are written but the meshes'
 * pipelines were built without fog code, so nothing shows. The scene also
 * needs a camera, because without one the fog uniforms are never written.
 */
export function addMist(scene: SceneContext): void {
    // Use setFog with a new object. Assigning scene.fog directly adds the fog
    // shader code but leaves the fog uniforms at 0 (mode 0, no fog), and
    // editing an existing scene.fog in place is not uploaded until the camera
    // moves.
    setFog(scene, {
        mode: FOG_MODE_LINEAR,
        start: 30,
        end: 120,
        density: 0, // linear fog doesn't use density
        color: [0.75, 0.8, 0.88],
    });
}
