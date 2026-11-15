import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

/**
 * Per-scene ordered list of update systems. Keyed weakly by scene so a
 * disposed scene's list can be garbage-collected.
 */
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta in
 * milliseconds, in the order they were added (first added runs first). Systems
 * added later, even while the game is already running, join the end of that
 * order. Systems added to one scene never run for another scene.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    systems = [];
    systemsByScene.set(scene, systems);
    // One callback per scene drives all of its systems, so the order is
    // controlled here rather than by the callback order of onBeforeRender
    // (which runs newest callback first).
    const list = systems;
    scene.onBeforeRender((deltaMs: number) => {
      // Snapshot the length so a system added during this frame first runs
      // on the next frame and each system runs exactly once per frame.
      const count = list.length;
      for (let i = 0; i < count; i++) {
        list[i](deltaMs);
      }
    });
  }
  systems.push(update);
}
