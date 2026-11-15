import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// Per-scene list of systems, in the order they were added.
// Each scene gets exactly one onBeforeRender callback, which runs the list in order.
// (Separate onBeforeRender callbacks would run in reverse registration order.)
const systemsByScene = new WeakMap<SceneContext, System[]>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: System[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs: number) => {
            // Snapshot the count so a system added during this frame first runs on the next frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
