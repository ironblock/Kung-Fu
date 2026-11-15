import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

const copy = (v: Vec): Vec => ({ x: v.x, y: v.y, z: v.z });

function assign(out: Vec, v: Vec): void {
    out.x = v.x;
    out.y = v.y;
    out.z = v.z;
}

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera(copy(eye), copy(target));
    scene.camera = camera;

    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(eye: Vec, target: Vec): void {
            // Copy first, in case the caller passed camera.position / camera.target themselves.
            const e = copy(eye);
            const t = copy(target);

            // The controls steer by the camera's internal yaw/pitch (FreeCamera._yaw/_pitch),
            // so setting position/target alone could leave them on the old heading: the next
            // drag would snap back and W would fly the old way. Let the library work out
            // yaw/pitch for the new view with its own conventions, on a throwaway camera.
            const view = createFreeCamera(e, t);

            // Drop the old controls so no stale state (held keys, inertia, a cached heading) survives.
            detach?.();
            detach = null;

            camera._yaw = view._yaw;
            camera._pitch = view._pitch;
            assign(camera.position, e);
            assign(camera.target, t);
            // In case a position/target observer changed yaw/pitch while the components were being written.
            camera._yaw = view._yaw;
            camera._pitch = view._pitch;

            // New controls start from the view we just set.
            if (!disposed) detach = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            disposed = true;
            // attachFreeControl's disposer removes its canvas listeners and its per-frame hook on the scene.
            detach?.();
            detach = null;
        },
    };
}
