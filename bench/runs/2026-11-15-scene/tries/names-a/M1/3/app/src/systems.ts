import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// One ordered list per scene. Each scene gets exactly one before-render hook,
// which runs that scene's list in insertion order.
const systemsByScene = new WeakMap<SceneContext, System[]>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: System[] = [];
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs: number) => {
            // Snapshot the length so systems added during this frame first run next frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
        systems = list;
    }
    systems.push(update);
}
