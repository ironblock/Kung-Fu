import type { SceneContext } from "@babylonjs/lite";

// Per-scene list of update systems, kept in the order they were added.
// Keyed by scene so that each scene runs only the systems added to it.
const systemsByScene = new WeakMap<SceneContext, Array<(deltaMs: number) => void>>();

// Scenes whose frame hook has already been installed (installed once per scene).
const hookInstalled = new WeakSet<SceneContext>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * each system added to that scene is called once with the frame's delta time
 * in milliseconds, in the order in which systems were added (first added,
 * first called). Systems may be added at any time, including while the scene
 * is already running; they are appended to the end of the order.
 */
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  // Install the frame hook before recording anything, so a failure leaves no partial state.
  if (!hookInstalled.has(scene)) {
    installFrameHook(scene);
    hookInstalled.add(scene);
  }

  let systems = systemsByScene.get(scene);
  if (!systems) {
    systems = [];
    systemsByScene.set(scene, systems);
  }
  systems.push(update);
}

/**
 * Runs every system currently registered for `scene`, in order, once each.
 * The count is taken at the start of the frame, so a system added during this
 * frame first runs on the next frame, and a system that keeps adding systems
 * cannot cause an endless loop.
 */
function runSystems(scene: SceneContext, deltaMs: number): void {
  const systems = systemsByScene.get(scene);
  if (!systems) return;
  const count = systems.length;
  for (let i = 0; i < count; i++) {
    systems[i](deltaMs);
  }
}

/**
 * Connects `runSystems` to the scene's per-frame render loop so it runs before
 * the scene renders.
 *
 * UNVERIFIED: the Babylon Lite 1.39.0 API for a before-render frame hook was not
 * available to check (the library is not installed in this app). Replace the
 * throw below with the library's actual before-render hook for this scene,
 * calling runSystems(scene, deltaMs) with the frame delta in milliseconds.
 */
function installFrameHook(scene: SceneContext): void {
  void runSystems; // referenced so the wiring point is obvious once filled in
  throw new Error(
    `systems: the Babylon Lite before-render hook is not wired up yet (scene: ${typeof scene})`,
  );
}
