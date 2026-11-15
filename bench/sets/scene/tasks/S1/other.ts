import { setFog } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Another right answer: register fog first, then replace the settings object on the scene.
// The registered writer reads scene.fog each frame, so the later object is the one uploaded.
export function addMist(scene: SceneContext): void {
    setFog(scene, { mode: 1, density: 0.02, start: 0, end: 1, color: [1, 1, 1] });
    scene.fog = { mode: 3, density: 0.01, start: 30, end: 120, color: [0.75, 0.8, 0.88] };
}
