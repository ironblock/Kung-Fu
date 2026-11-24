import type { SceneContext } from "@babylonjs/lite";

export function addMist(scene: SceneContext): void {
    // Fog modes as in Babylon.js: 1 exp, 2 exp2, 3 linear.
    scene.fog = { mode: 3, density: 0, start: 30, end: 120, color: [0.75, 0.8, 0.88] };
}
