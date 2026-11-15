import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // The keyboard/mouse controls move the camera by its yaw/pitch, so those
    // must match the view we want (see camera-notes.md, note 9).
    const detachControls = attachFreeControl(camera, canvas, scene);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // Let createFreeCamera work out yaw/pitch for the new view, so this
            // stays consistent with the library's own convention.
            const reference = createFreeCamera(
                { x: newEye.x, y: newEye.y, z: newEye.z },
                { x: newTarget.x, y: newTarget.y, z: newTarget.z },
            );

            // Edit position and target in place: they are readonly ObservableVec3 fields.
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            camera._yaw = reference._yaw;
            camera._pitch = reference._pitch;
        },

        dispose(): void {
            // attachFreeControl's returned function is the only thing that removes its listeners
            // and per-frame work; this module adds nothing else.
            detachControls();
        },
    };
}
