import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

export function addMist(scene: SceneContext): void {
    // setFog both stores the settings and registers the writer that uploads them each frame.
    setFog(scene, { mode: 3, density: 0, start: 30, end: 120, color: [0.75, 0.8, 0.88] });
}
