import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// One ordered list per scene. Each scene only ever runs the systems added to it.
const systemsByScene = new WeakMap<SceneContext, System[]>();

/**
 * Adds an update system to a scene. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta time
 * in milliseconds, in the order they were added (first added, first run).
 *
 * A system added while a frame is running first runs in the next frame.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    const list: System[] = [];
    systems = list;
    systemsByScene.set(scene, list);

    // A single per-scene hook drives the list, so the order is ours and does
    // not depend on how the library orders its own beforeRender callbacks.
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
