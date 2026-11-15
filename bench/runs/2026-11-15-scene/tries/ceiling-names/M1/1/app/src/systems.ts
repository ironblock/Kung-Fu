import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Systems for each scene, kept in the order they were added.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each of the scene's systems is called once with the frame's delta time in
 * milliseconds, in the order they were added (first added runs first).
 *
 * Each scene gets a single before-render hook that runs our own ordered
 * list, so the order does not depend on how the library orders its
 * before-render callbacks.
 *
 * A system added while a frame's systems are running starts on the next
 * frame, after every system added before it.
 */
export function addSystem(scene: SceneContext, update: UpdateSystem): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: UpdateSystem[] = [];
        onBeforeRender(scene, (deltaMs) => {
            // Fix the count for this frame so systems added during the loop
            // wait until the next frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
        systemsByScene.set(scene, list);
        systems = list;
    }
    systems.push(update);
}
