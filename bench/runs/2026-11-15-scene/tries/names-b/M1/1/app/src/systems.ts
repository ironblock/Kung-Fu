import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Per-scene list of systems, in the order they were added.
// Keyed weakly so scenes that are discarded can be garbage collected.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta time
 * in milliseconds, in the order the systems were added (first added runs first).
 *
 * Systems added while the game is already running are appended and run from
 * the next frame onwards. A system added during a frame does not run in that
 * same frame.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    const list: UpdateSystem[] = [];
    systems = list;
    systemsByScene.set(scene, list);

    // One per-frame hook per scene. It runs this scene's systems in array order,
    // so the ordering does not depend on how other pre-render hooks are interleaved.
    onBeforeRender(scene, (deltaMs: number) => {
      // Snapshot the length so systems added mid-frame wait until the next frame.
      const count = list.length;
      for (let i = 0; i < count; i++) {
        list[i](deltaMs);
      }
    });
  }
  systems.push(update);
}
