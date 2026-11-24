import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

type SystemUpdate = (deltaMs: number) => void;

// Per-scene ordered list of update systems. Each scene gets its own list, so a
// scene only ever runs the systems that were added to it.
const systemsByScene = new WeakMap<SceneContext, SystemUpdate[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders, each
 * system added to that scene is called once with the frame's delta in ms, in the
 * order the systems were added (first added, first run), including systems added
 * after the game has been running for a while.
 *
 * A system added while a frame is being updated first runs in the next frame.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let systems = systemsByScene.get(scene);
    if (systems === undefined) {
        // First system for this scene: create its list and register one
        // pre-render callback that drives the whole list in order.
        const list: SystemUpdate[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        onBeforeRender(scene, (deltaMs: number) => {
            // Snapshot the length so systems added during this loop start next frame.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
