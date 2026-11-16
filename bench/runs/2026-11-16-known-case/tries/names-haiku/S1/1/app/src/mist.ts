import type { SceneContext } from "@babylonjs/lite";

const FOG_START = 30;
const FOG_END = 120;
const FOG_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    scene.fog = {
        mode: "linear",
        start: FOG_START,
        end: FOG_END,
        color: FOG_COLOR,
    };
}
