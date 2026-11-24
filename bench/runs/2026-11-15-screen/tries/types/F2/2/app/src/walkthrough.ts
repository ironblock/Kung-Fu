import {
    attachFreeControl,
    createFreeCamera,
    type FreeCamera,
    type SceneContext,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

/**
 * Free-camera walkthrough with the library's standard keyboard and mouse
 * controls. The camera is shown as `scene.camera`; `jumpTo` moves it to a new
 * eye/target pair and the controls continue from there.
 */
export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera(eye, target);
    scene.camera = camera;

    // The library's standard FreeCamera keyboard + mouse controls. The returned
    // cleanup removes the canvas listeners and the per-frame hook.
    const detachControls = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // The free-camera controls keep the view direction in the internal
            // yaw/pitch fields and derive the look target from them, so moving
            // only position/target would be undone by the next input frame.
            // Use a scratch camera built with the library's own factory to get
            // yaw/pitch for the new view, rather than re-deriving the convention.
            const aim = createFreeCamera(newEye, newTarget);

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera._yaw = aim._yaw;
            camera._pitch = aim._pitch;
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
