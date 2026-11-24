import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/**
 * Adds a light morning mist to the scene: linear distance fog that starts
 * at 30 units from the camera and is fully the fog colour from 120 units on.
 *
 * Must be called before `registerScene(scene)`. Fog set after registration
 * writes the uniforms but the meshes' pipelines have no fog code, so no mist
 * is drawn.
 */
export function addMist(scene: SceneContext): void {
  // mode 3 = linear. setFog (not scene.fog = {...}) so the fog uniforms are written.
  setFog(scene, {
    mode: 3,
    start: 30,
    end: 120,
    density: 0,
    color: [0.75, 0.8, 0.88],
  });
}
