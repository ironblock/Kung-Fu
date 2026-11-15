import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

/**
 * Linear fog mode value. Assumed to match Babylon's FOGMODE_LINEAR (3); the
 * FogConfig declaration (material/standard/standard-material) was not among the
 * provided type declarations, so confirm this value and the field names there.
 */
const FOG_MODE_LINEAR = 3;

/**
 * Adds a light morning mist: linear distance fog that starts at 30 units from
 * the camera (no fog nearer than that) and reaches the full pale grey-blue fog
 * colour at 120 units.
 *
 * Call before `registerScene()` so the standard materials are built with fog.
 */
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: FOG_MODE_LINEAR,
        density: 0, // unused by linear fog
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
