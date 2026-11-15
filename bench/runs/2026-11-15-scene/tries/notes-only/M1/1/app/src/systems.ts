import type { SceneContext } from "@babylonjs/lite";
import { onBeforeRender } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Per-scene list of systems, in the order they were added.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each system added to that scene is called once, in the order they were added.
 *
 * Babylon's onBeforeRender runs its callbacks newest first, so instead of
 * registering one callback per system, we register a single callback per scene
 * (on the first addSystem call) that runs that scene's list in insertion order.
 * Systems added later are appended and run from the next frame on.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        systems = [];
        systemsByScene.set(scene, systems);
        const list = systems;
        onBeforeRender(scene, (deltaMs: number) => {
            // Snapshot the length so a system added during this frame runs next frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
