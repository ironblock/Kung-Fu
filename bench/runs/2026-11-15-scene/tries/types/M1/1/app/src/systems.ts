import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

/**
 * Per-scene ordered system lists. A WeakMap keeps scenes collectable and
 * guarantees each scene only ever runs the systems added to it.
 */
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

/**
 * Add an update system to `scene`. Systems run once per frame, before the
 * scene renders, in the order they were added (first added runs first). Systems
 * may be added at any time, including after the scene has been running.
 *
 * The first system added to a scene registers a single per-frame dispatcher with
 * the scene. That dispatcher walks this scene's list by index on every frame, so
 * the order is fixed by this list and not by how the engine orders its own
 * before-render callbacks.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (systems === undefined) {
    const list: UpdateSystem[] = [];
    systems = list;
    systemsByScene.set(scene, list);
    onBeforeRender(scene, (deltaMs: number) => {
      // Index-based loop with a live length check: each system is called exactly
      // once per frame, and a system added during this loop is picked up in it.
      for (let i = 0; i < list.length; i++) {
        list[i](deltaMs);
      }
    });
  }
  systems.push(update);
}
