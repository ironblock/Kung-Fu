import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

// Per-scene list of update systems, in the order they were added.
// Each scene gets exactly one onBeforeRender callback (installed on its first
// system) that runs its own list. This keeps the order fixed regardless of
// how the library orders its own onBeforeRender callbacks (it puts each new
// callback at the front), and it works for systems added at any time.
const systemsByScene = new WeakMap<SceneContext, Array<(deltaMs: number) => void>>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: Array<(deltaMs: number) => void> = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs: number) => {
            // Snapshot the length so a system added during this frame first runs
            // next frame, and every system runs exactly once per frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
