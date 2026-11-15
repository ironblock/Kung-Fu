import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Per-scene list of systems, in the order they were added.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to a scene. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta in
 * milliseconds, in the order the systems were added (first added runs first).
 *
 * Only one onBeforeRender callback is registered per scene: separately
 * registered callbacks run in reverse order, so ordering is handled here.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    const list: UpdateSystem[] = [];
    systems = list;
    systemsByScene.set(scene, list);
    onBeforeRender(scene, (deltaMs: number) => {
      // Iterate over a snapshot so a system added during this frame
      // starts running on the next frame instead of changing this loop.
      for (const system of list.slice()) {
        system(deltaMs);
      }
    });
  }
  systems.push(update);
}
