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

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // The free-camera controls aim from camera._yaw / camera._pitch, which are
    // only set at creation and by the controls' own drags. Keep them in step
    // with every jump, otherwise W and drags would ignore the new target.
    const disposeControls = attachFreeControl(camera, canvas, scene);

    function jumpTo(newEye: Vec, newTarget: Vec): void {
        // A throwaway camera built from the new eye/target gives the yaw and
        // pitch the library itself derives for that view, so this does not
        // depend on the yaw/pitch convention.
        const probe = createFreeCamera(
            { x: newEye.x, y: newEye.y, z: newEye.z },
            { x: newTarget.x, y: newTarget.y, z: newTarget.z },
        );
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;

        // Write position and target in place (both are readonly ObservableVec3),
        // after the angles, so the observable writes come last.
        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;
        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;
    }

    return {
        camera,
        jumpTo,
        dispose() {
            disposeControls();
        },
    };
}
