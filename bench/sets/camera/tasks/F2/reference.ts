import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }

// The controls steer from a heading the camera computes once, at creation, from eye and target.
// Writing position/target later does not update it, so each jump builds a fresh camera.
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    let camera = createFreeCamera(eye, target);
    let detach = attachFreeControl(camera, canvas, scene);
    scene.camera = camera;
    return {
        get camera() {
            return camera;
        },
        jumpTo(e: Vec, t: Vec): void {
            const next = createFreeCamera(e, t);
            next.speed = camera.speed;
            next.angularSensitivity = camera.angularSensitivity;
            next.inertia = camera.inertia;
            next.fov = camera.fov;
            next.nearPlane = camera.nearPlane;
            next.farPlane = camera.farPlane;
            detach();
            camera = next;
            detach = attachFreeControl(camera, canvas, scene);
            scene.camera = camera;
        },
        dispose(): void {
            detach();
        },
    };
}
