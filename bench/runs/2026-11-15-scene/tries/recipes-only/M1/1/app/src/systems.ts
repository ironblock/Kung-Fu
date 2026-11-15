import type { SceneContext } from "@babylonjs/lite";

type UpdateSystem = (deltaMs: number) => void;

// Systems per scene, in the order they were added. Only ever appended to, so
// the first system added is always the first one run, even if added late.
const systemsByScene = new WeakMap<SceneContext, UpdateSystem[]>();

// UNVERIFIED: the per-frame, before-render hook of Babylon Lite 1.39.0 is not
// documented in scene-recipes.md and the library is not installed here, so this
// is the one place that must be wired to the real API. It must call `cb` once per
// frame, before the scene renders, with the frame's delta time in milliseconds.
function subscribeBeforeRender(scene: SceneContext, cb: (deltaMs: number) => void): void {
  void scene;
  void cb;
  throw new Error("systems.ts: subscribeBeforeRender is not wired to the Babylon Lite frame hook yet");
}

function runSystems(scene: SceneContext, deltaMs: number): void {
  const systems = systemsByScene.get(scene);
  if (!systems) return;
  // Capture the length first: a system added during this frame runs from the next frame on.
  const count = systems.length;
  for (let i = 0; i < count; i++) {
    systems[i](deltaMs);
  }
}

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
  let systems = systemsByScene.get(scene);
  if (!systems) {
    systems = [];
    systemsByScene.set(scene, systems);
    subscribeBeforeRender(scene, (deltaMs) => runSystems(scene, deltaMs));
  }
  systems.push(update);
}
