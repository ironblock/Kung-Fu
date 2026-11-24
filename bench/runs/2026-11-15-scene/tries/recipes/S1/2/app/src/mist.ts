import type { SceneContext } from "@babylonjs/lite";
import { rebuildSceneRenderables, setFog } from "@babylonjs/lite";

// Linear distance fog for the harbour scene: nothing is fogged nearer than
// 30 units from the camera, and from 120 units on everything is the fog colour.
const FOG_MODE_LINEAR = 3;
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
  // setFog stores a new fog object; the shaders only pick it up through the
  // scene's fog uniforms, and fog compiled in at registerScene is only
  // rebuilt by rebuildSceneRenderables.
  setFog(scene, {
    mode: FOG_MODE_LINEAR,
    density: 0,
    start: MIST_START,
    end: MIST_END,
    color: [...MIST_COLOR],
  });

  // If the scene is already built, the standard materials were compiled
  // without fog, so their shaders must be rebuilt before the next frame.
  // addMist is synchronous, so the rebuild is started here and not awaited.
  if (scene._built) {
    rebuildSceneRenderables(scene).catch((err: unknown) => {
      console.error("addMist: rebuildSceneRenderables failed", err);
    });
  }
}
