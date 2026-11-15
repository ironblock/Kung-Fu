import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// attachFreeControl aims from these two fields, and only sets them at creation and
// through its own drags (camera-notes.md items 7 and 27). A target written by hand is
// overwritten on the next key move or drag, so the aim has to be written here too.
// They are not part of the public typings as far as we know, hence the cast.
interface FreeAim {
    _yaw: number;
    _pitch: number;
}

// Pitch is clamped by the control to +-(PI/2 - 0.01) (item 27).
const PITCH_LIMIT = Math.PI / 2 - 0.01;

// Puts the camera at `eye`, looking at `target`, with the control's yaw/pitch matching
// that view, so that W flies toward the new target and a drag turns from there.
// Convention assumed: forward = (cos p * sin y, sin p, cos p * cos y), where a positive
// pitch looks up (item 27: dragging down lowers pitch and looks down). yaw 0 looks +Z.
function setPose(camera: FreeCamera, eye: Vec, target: Vec): void {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.hypot(dx, dy, dz);

    let yaw = 0;
    let pitch = 0;
    if (len > 1e-9) {
        yaw = Math.atan2(dx, dz);
        pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, Math.asin(dy / len)));
    }
    const dist = len > 1e-9 ? len : 1;

    const cp = Math.cos(pitch);
    const fx = cp * Math.sin(yaw);
    const fy = Math.sin(pitch);
    const fz = cp * Math.cos(yaw);

    camera.position.x = eye.x;
    camera.position.y = eye.y;
    camera.position.z = eye.z;

    // Write in place: assigning a new target object is not reliably picked up.
    camera.target.x = eye.x + fx * dist;
    camera.target.y = eye.y + fy * dist;
    camera.target.z = eye.z + fz * dist;

    const aim = camera as unknown as FreeAim;
    aim._yaw = yaw;
    aim._pitch = pitch;
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera("walkthrough", { x: eye.x, y: eye.y, z: eye.z }, scene);
    scene.camera = camera;
    setPose(camera, eye, target);

    const detach = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            setPose(camera, newEye, newTarget);
        },
        dispose(): void {
            if (disposed) return;
            disposed = true;
            detach();
        },
    };
}
