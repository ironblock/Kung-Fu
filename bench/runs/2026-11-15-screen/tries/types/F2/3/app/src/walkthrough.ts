import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

/**
 * Free-camera walkthrough with the library's keyboard/mouse controls.
 *
 * The controls keep inertia and look state inside their closure, so `jumpTo`
 * detaches them, moves the pose, and attaches a fresh set. That discards any
 * stale inertia so the new view starts still, and W flies toward the new target.
 */
export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
    );
    scene.camera = camera;

    let detach: (() => void) | null = null;
    let disposed = false;

    const applyPose = (e: Vec, t: Vec): void => {
        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;

        // Look angles from the eye->target direction, matching the library's
        // Babylon-style FreeCamera convention (forward at zero rotation is +Z).
        // These are internal fields; this is the one place we rely on that layout.
        const dx = t.x - e.x;
        const dy = t.y - e.y;
        const dz = t.z - e.z;
        const len = Math.hypot(dx, dy, dz);
        camera._yaw = Math.atan2(dx, dz);
        camera._pitch = len > 0 ? Math.asin(-dy / len) : 0;
    };

    const attach = (): void => {
        detach = attachFreeControl(camera, canvas, scene);
    };

    const detachControls = (): void => {
        if (detach) {
            detach();
            detach = null;
        }
    };

    applyPose(eye, target);
    attach();

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;
            detachControls();
            applyPose(newEye, newTarget);
            attach();
        },
        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
