import { ArcRotateCamera, Vector3 } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Orbit camera looking at the origin from 10 units away.
// Mouse and touch orbit/zoom come from attachControl. The scene is passed in so that
// the control modules can register their per-frame hooks (ledger row
// "scene: three control modules hook the frame only when given a scene").
// NOTE: the library source is not available here, so the attachControl argument
// order and the keyboard (arrow-key) setup below are unverified against Babylon Lite 1.39.0.
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = new ArcRotateCamera(
        "orbitCamera",
        Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        scene,
    );

    camera.attachControl(canvas, true, scene);

    return camera;
}
