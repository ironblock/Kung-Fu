import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Light morning mist: linear distance fog (mode 3).
// Nothing closer than 30 units is fogged; at 120 units and beyond the
// scene is fully the fog colour (pale grey-blue).
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
  // setFog writes the fog uniforms. Call this before registerScene so the
  // fog is compiled into the shaders at registration. If the scene is
  // already registered, the shaders also need a rebuild before fog shows.
  setFog(scene, {
    mode: 3,
    density: 0,
    start: MIST_START,
    end: MIST_END,
    color: MIST_COLOR,
  });
}
