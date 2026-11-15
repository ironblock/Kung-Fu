import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

// Per-scene list of update systems, in the order they were added.
// Keyed by scene so each scene runs only the systems added to it.
const systemsByScene = new WeakMap<SceneContext, Array<(deltaMs: number) => void>>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta time
 * in milliseconds, in the order in which they were added (first added runs
 * first). Systems added while the game is already running are included from
 * the next frame onward.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    // First system for this scene: create its list and register a single
    // per-scene dispatcher. All later systems go into the list, so their
    // order is controlled here rather than by the render-callback mechanism.
    const list: Array<(deltaMs: number) => void> = [];
    systems = list;
    systemsByScene.set(scene, list);
    onBeforeRender(scene, (deltaMs: number) => {
      // Snapshot the length so a system added during this frame first runs
      // next frame, and each system runs exactly once per frame.
      const count = list.length;
      for (let i = 0; i < count; i++) {
        list[i](deltaMs);
      }
    });
  }
  systems.push(update);
}
