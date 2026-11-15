import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// One ordered list per scene. Each scene gets exactly one onBeforeRender
// callback (the dispatcher), which runs its own list in insertion order.
// onBeforeRender itself runs newest-first, so it cannot be used per system.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: UpdateSystem[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs: number) => {
            // Index loop, so a system added during a frame still runs in
            // this frame, after the systems that were already added.
            for (let i = 0; i < list.length; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
