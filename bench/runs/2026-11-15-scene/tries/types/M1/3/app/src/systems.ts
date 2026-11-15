import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

/**
 * Register an update system on a scene. Each frame, before the scene renders,
 * every system added to that scene is called once with the frame's delta time
 * in milliseconds.
 *
 * Systems run in the order they were added to the scene (first added, first run),
 * including systems added after the scene has already been running. Each scene
 * only runs the systems added to it.
 *
 * Implemented on top of the scene's own before-render list (`onBeforeRender`),
 * which is per scene and runs callbacks in registration order. Every call wraps
 * `update` in a new closure, so the same function can be added more than once.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    onBeforeRender(scene, (deltaMs: number) => {
        update(deltaMs);
    });
}
