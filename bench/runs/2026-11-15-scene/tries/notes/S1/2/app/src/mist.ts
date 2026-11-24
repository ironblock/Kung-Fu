import type { SceneContext } from "@babylonjs/lite";
// setFog is declared in scene/scene-ubo-extras.d.ts but is not re-exported by
// scene/scene.d.ts, so the root import below is assumed, not verified.
import { setFog } from "@babylonjs/lite";

/**
 * Linear distance fog for the harbour scene: nothing is fogged nearer than
 * 30 units from the camera, and everything from 120 units out is fully the
 * pale grey-blue fog colour.
 *
 * Call this before registerScene (or before the first build): standard meshes
 * built while the scene has no fog keep fog-free shaders after a later setFog.
 */
export function addMist(scene: SceneContext): void {
    // Assumed FogConfig field names (its declaration is not in the provided files).
    setFog(scene, {
        mode: "linear",
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
