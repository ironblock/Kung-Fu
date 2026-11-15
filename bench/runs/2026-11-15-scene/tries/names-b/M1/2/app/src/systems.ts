import type { SceneContext } from "@babylonjs/lite";
import { onBeforeRender } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Per-scene, insertion-ordered list of update systems.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to `scene`. Each frame, before the scene renders, every
 * system added to that scene is called once with the frame delta in milliseconds,
 * in the order the systems were added (first added runs first).
 *
 * A system added while a frame's update is already running takes effect from the
 * next frame; it is not called in the frame in which it was added.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    const list: UpdateSystem[] = [];
    systems = list;
    systemsByScene.set(scene, list);

    // One before-render hook per scene drives all of that scene's systems in order.
    onBeforeRender(scene, (deltaMs: number) => {
      // Snapshot the length so systems added mid-frame start on the next frame.
      const count = list.length;
      for (let i = 0; i < count; i++) {
        list[i](deltaMs);
      }
    });
  }
  systems.push(update);
}
