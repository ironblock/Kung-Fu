import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// Systems for each scene, in the order they were added. A WeakMap so a
// disposed scene and its systems can be garbage-collected.
const systemsByScene = new WeakMap<SceneContext, System[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta time
 * in milliseconds, in the order the systems were added (first added runs
 * first). This includes systems added while the scene is already running.
 *
 * Only one before-render callback is registered per scene, and it runs our
 * own ordered list. So the order is set here and does not depend on how the
 * library orders several before-render callbacks.
 *
 * A system added during a frame (for example by another system) starts
 * running on the next frame.
 */
export function addSystem(scene: SceneContext, update: System): void {
    let systems = systemsByScene.get(scene);
    if (!systems) {
        const list: System[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs) => {
            // Read the length once, so systems added during this frame
            // start next frame. They still go after every earlier system.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
