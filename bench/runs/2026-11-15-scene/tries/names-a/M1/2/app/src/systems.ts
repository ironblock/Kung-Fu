import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/**
 * Registers an update system on a scene. Each frame, before the scene renders,
 * the system is called once with the frame's delta time in milliseconds.
 *
 * Systems run in the order they were added to the scene (first added, first run),
 * including systems added after the scene has already been running. Each scene
 * only runs the systems added to it.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    onBeforeRender(scene, update);
}
