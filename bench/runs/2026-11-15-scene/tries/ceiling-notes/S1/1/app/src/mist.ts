import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// The fog config type is taken from setFog itself, so the compiler checks the
// fields below against the library's real FogConfig (its declaration was not
// in scene-api.d.ts).
type FogConfig = Parameters<typeof setFog>[1];

/**
 * Light morning mist: linear distance fog, clear up to 30 units from the
 * camera and fully pale grey-blue from 120 units on.
 *
 * Goes through setFog with a fresh object on every call. Assigning
 * scene.fog writes no uniforms until setFog has run once, and changing an
 * existing fog object in place is only uploaded when the camera or aspect
 * changes (scene-notes.md, note 8). Neither would reach the next frame.
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
