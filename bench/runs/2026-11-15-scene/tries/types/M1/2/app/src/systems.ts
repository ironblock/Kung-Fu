import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type SystemUpdate = (deltaMs: number) => void;

// Per-scene ordered list of update systems. Keyed by scene so each scene runs only its own systems.
const systemsByScene = new WeakMap<SceneContext, SystemUpdate[]>();

/**
 * Add an update system to `scene`. Every frame, before the scene renders, each system added to
 * that scene is called once with the frame's delta time in milliseconds, in the order they were
 * added. Systems added after the scene is already running are appended to the end of that order.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        const list: SystemUpdate[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        // One per-frame callback per scene drives all of that scene's systems in insertion order.
        // The length is re-read on every iteration, so a system added during a frame is called in
        // that same frame, after the systems that were already present.
        onBeforeRender(scene, (deltaMs: number) => {
            for (let i = 0; i < list.length; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
