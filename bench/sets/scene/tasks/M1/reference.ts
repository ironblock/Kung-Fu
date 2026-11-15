import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type Update = (deltaMs: number) => void;
const lists = new WeakMap<SceneContext, Update[]>();

// onBeforeRender puts each new callback at the FRONT of the scene's per-frame list, so callbacks
// registered one by one run last-registered first. One dispatcher per scene keeps our own order.
export function addSystem(scene: SceneContext, update: Update): void {
    let list = lists.get(scene);
    if (!list) {
        const systems: Update[] = [];
        list = systems;
        lists.set(scene, systems);
        onBeforeRender(scene, (deltaMs) => {
            for (const system of [...systems]) {
                system(deltaMs);
            }
        });
    }
    list.push(update);
}
