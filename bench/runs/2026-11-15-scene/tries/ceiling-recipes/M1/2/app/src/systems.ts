import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// One ordered list of systems per scene. A WeakMap so a disposed scene can be collected.
const systemsByScene = new WeakMap<SceneContext, System[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders, each system added to
 * that scene is called once with the frame's delta in milliseconds, in the order the systems were
 * added (first added runs first), including systems added while the scene is already running.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (!systems) {
        const list: System[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        // Callbacks registered with onBeforeRender run in reverse order (the one registered last
        // runs first), so each system is not registered on its own. Each scene gets one callback
        // that runs its systems from our own list, in the order they were added.
        onBeforeRender(scene, (deltaMs) => {
            // A system added during this loop (for example by another system) starts next frame.
            // That way no frame runs only some of the systems.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
