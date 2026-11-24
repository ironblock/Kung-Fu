import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Per-scene ordered list of update systems. Each scene gets exactly one
// onBeforeRender callback (registered on first use) that runs its own list.
//
// onBeforeRender runs its callbacks newest first, so registering each system
// with it directly would reverse the order. Instead, a single dispatcher is
// registered per scene and calls the systems in insertion order.
const systemsByScene = new WeakMap<SceneContext, Array<(deltaMs: number) => void>>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: Array<(deltaMs: number) => void> = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs: number) => {
            // Snapshot the length so a system added during this frame first runs
            // on the next frame, and each system runs exactly once per frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
