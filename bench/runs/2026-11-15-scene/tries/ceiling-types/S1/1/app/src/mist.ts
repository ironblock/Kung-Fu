import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

/** The fog settings `setFog` takes (the library's `FogConfig`). Taken from `setFog`
 *  so this file does not depend on where `FogConfig` itself is exported. */
type FogConfig = Parameters<typeof setFog>[1];

/** Fog mode number for linear fog, as in Babylon.js (`Scene.FOGMODE_LINEAR`). */
const FOG_MODE_LINEAR = 3;

/**
 * Give the scene a light morning mist: linear distance fog. Nothing nearer than
 * 30 units from the camera is fogged, and from 120 units on everything is fully
 * the fog colour, a pale grey-blue.
 */
export function addMist(scene: SceneContext): void {
    const mist: FogConfig = {
        mode: FOG_MODE_LINEAR,
        start: 30,
        end: 120,
        // Linear fog does not use density; 0.1 is Babylon's default.
        density: 0.1,
        color: [0.75, 0.8, 0.88],
    };
    // Use setFog, not a plain `scene.fog = ...`. Fog is opt-in, and setFog is what
    // registers the writer that copies these values into the shaders' scene uniforms.
    // Assigning scene.fog alone would never reach the rendered frame.
    setFog(scene, mist);
}
