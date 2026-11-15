import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

/**
 * Light morning mist: linear distance fog that starts 30 units from the
 * camera and is fully opaque from 120 units on, in a pale grey-blue.
 *
 * Uses `setFog` rather than assigning `scene.fog` directly, so the library
 * can invalidate its cached scene uniforms and the next frame's shaders see
 * the new values.
 */
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        start: 30,
        end: 120,
        color: [0.75, 0.8, 0.88],
    });
}
