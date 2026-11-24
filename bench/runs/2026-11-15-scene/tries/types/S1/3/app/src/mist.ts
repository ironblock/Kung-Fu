import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

/** Distance from the camera (world units) before any fog is applied. */
const MIST_START = 30;
/** Distance from the camera (world units) at which the scene is fully fogged. */
const MIST_END = 120;
/** Pale grey-blue fog colour, linear RGB. */
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

/**
 * Give the scene a light morning mist: linear distance fog that starts at 30
 * units from the camera and reaches the full fog colour at 120 units.
 * Call before the scene is registered so the fog uniforms are part of the
 * first frame.
 */
export function addMist(scene: SceneContext): void {
    setFog(scene, {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: MIST_COLOR,
    });
}
