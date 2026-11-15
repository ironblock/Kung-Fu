import {
    attachControl,
    createArcRotateCamera,
    onSceneDispose,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit (arc-rotate) camera that looks at the origin from 10 units
 * away and wires up the library's standard mouse/touch controls on `canvas`.
 *
 * Notes from camera-ledger.toml (Babylon Lite 1.39.0):
 * - attachControl applies all motion in a per-frame hook that is only added
 *   when a scene is passed, so the scene must be passed here.
 * - The control disposer is not tied to the scene's lifetime (disposeScene
 *   leaves the canvas listeners), so it is registered with onSceneDispose.
 *
 * TODO(keyboard): the request also asks for the library's own arrow-key
 * control. Nothing in camera-ledger.toml documents a keyboard/arrow-key API
 * for the arc-rotate camera (neither a separate function nor an option on
 * attachControl), so it has not been wired up yet rather than guessing a name.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera("orbitCamera", -Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Set the pose explicitly through the camera's own fields so the result
    // does not depend on how the constructor arguments are interpreted.
    camera.target.set(0, 0, 0);
    camera.radius = 10;

    const detach = attachControl(camera, canvas, scene);
    onSceneDispose(scene, detach);

    return camera;
}
