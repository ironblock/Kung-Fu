import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Like Babylon.js scene.registerBeforeRender: callbacks run in the order they were registered.
export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    onBeforeRender(scene, update);
}
