import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// The free camera keeps its steering angles in private fields that are only
// computed at creation (camera-notes.md 8, 36). Writing them is the only way to
// make the controls continue from a new view, so they are set directly here.
// Assumed convention (not verified against the library): yaw = atan2(dx, dz),
// pitch positive = looking down, look = (sin yaw cos p, -sin p, cos yaw cos p).
interface FreeCameraSteering {
    _yaw: number;
    _pitch: number;
}

const PITCH_LIMIT = Math.PI / 2 - 0.01; // camera-notes.md 33

function anglesFor(eye: Vec, target: Vec): { yaw: number; pitch: number } | null {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.hypot(dx, dy, dz);
    if (len === 0) return null; // no direction to look along; keep the current angles
    const yaw = Math.atan2(dx, dz);
    const pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, Math.asin(-dy / len)));
    return { yaw, pitch };
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    // Assumed signature: createFreeCamera(position, target). Unverified.
    const camera = createFreeCamera(eye, target);
    scene.camera = camera;

    const steering = camera as unknown as FreeCamera & FreeCameraSteering;
    const initial = anglesFor(eye, target);
    if (initial) {
        steering._yaw = initial.yaw;
        steering._pitch = initial.pitch;
    }

    // Assumed signature: attachFreeControl(canvas, scene), returning a disposer.
    // The scene argument is required for the controls to move the camera (camera-notes.md 34).
    let detach: (() => void) | null = attachFreeControl(canvas, scene) as unknown as () => void;

    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // Drop the controls so any turn or movement still coasting from before the jump
            // is not applied to the new view (camera-notes.md 33, 35), then re-attach.
            detach?.();
            detach = null;

            // In-place writes, as camera-notes.md 7 recommends for observable vectors.
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            const angles = anglesFor(newEye, newTarget);
            if (angles) {
                steering._yaw = angles.yaw;
                steering._pitch = angles.pitch;
            }

            detach = attachFreeControl(canvas, scene) as unknown as () => void;
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detach?.();
            detach = null;
        },
    };
}
