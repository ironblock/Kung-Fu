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

function copyVec(v: Vec): Vec {
    return { x: v.x, y: v.y, z: v.z };
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera(copyVec(eye), copyVec(target));
    scene.camera = camera;

    // attachFreeControl keeps its own target as position + a direction built from
    // camera._yaw / camera._pitch, so a jump has to set those as well as the position
    // and target. Rather than assume the library's yaw/pitch convention, take them from
    // a throwaway camera created for the new view, which the library computes itself.
    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            const probe = createFreeCamera(copyVec(newEye), copyVec(newTarget));

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera._yaw = probe._yaw;
            camera._pitch = probe._pitch;
        },
        dispose(): void {
            if (detach) {
                detach();
                detach = null;
            }
        },
    };
}
