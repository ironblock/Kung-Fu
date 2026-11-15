import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

/** Each scene's systems, in the order they were added. */
const systemsByScene = new WeakMap<SceneContext, System[]>();

/**
 * Add an update system to `scene`. Every frame, before the scene renders, each
 * system added to that scene is called once with the frame's delta time in ms,
 * in the order the systems were added (first added runs first). This also holds
 * for systems added after the scene has been running for a while.
 *
 * The library's `onBeforeRender` does not say what order it runs its callbacks
 * in, so we don't register one callback per system. Each scene gets one
 * dispatcher callback, and that dispatcher walks our own ordered list.
 *
 * A system added while the dispatcher is running (for example by another system)
 * first runs in the next frame.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: System[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs) => {
            // Read the count once, so systems added during this frame start next frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
