import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Per-scene list of systems, in the order they were added.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: UpdateSystem[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        // One pre-render hook per scene runs that scene's systems in insertion order.
        // Systems added later are appended, so they run after earlier ones every frame.
        onBeforeRender(scene, (deltaMs: number) => {
            // Capture the count first: a system added during this frame starts next frame,
            // so each system runs exactly once per frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
