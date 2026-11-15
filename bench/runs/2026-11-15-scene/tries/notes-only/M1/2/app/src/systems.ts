import type { SceneContext } from "@babylonjs/lite";
import { onBeforeRender } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Systems per scene, in the order they were added. Keyed weakly so a scene
// that is no longer referenced does not keep its systems alive.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to `scene`. Each frame, before the scene renders, every
 * system added to that scene is called once with the frame's delta time (ms),
 * in the order they were added.
 *
 * onBeforeRender runs callbacks in reverse registration order and cannot be
 * removed (see scene-notes.md, notes 12 and 27), so this registers a single
 * callback per scene and runs that scene's systems from its own ordered list.
 * Systems added while a frame is running are first called on the next frame.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    const list: UpdateSystem[] = [];
    systems = list;
    systemsByScene.set(scene, list);
    onBeforeRender(scene, (deltaMs: number) => {
      // Snapshot the length so systems added during this frame wait for the next one.
      const count = list.length;
      for (let i = 0; i < count; i++) {
        list[i](deltaMs);
      }
    });
  }
  systems.push(update);
}
