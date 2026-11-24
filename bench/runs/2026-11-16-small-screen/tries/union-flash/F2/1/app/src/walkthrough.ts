import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

const EPS = 1e-6;
const MAX_PITCH = Math.PI / 2 - 0.01;

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function asWritableVec(vec: unknown): Vec {
  return vec as Vec;
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera(eye, target);

  // The app's scene owns the active camera.  The exact SceneContext type is not
  // available here, so assign through a local cast.
  const sceneWithCamera = scene as unknown as { camera: FreeCamera | null };
  sceneWithCamera.camera = camera;

  const position = asWritableVec(camera.position);
  const targetRef = asWritableVec(camera.target);

  function applyPose(nextEye: Vec, nextTarget: Vec): void {
    const eyeVec = {
      x: finiteNumber(nextEye.x),
      y: finiteNumber(nextEye.y),
      z: finiteNumber(nextEye.z),
    };

    const targetVec = {
      x: finiteNumber(nextTarget.x),
      y: finiteNumber(nextTarget.y),
      z: finiteNumber(nextTarget.z),
    };

    const dx = targetVec.x - eyeVec.x;
    const dy = targetVec.y - eyeVec.y;
    const dz = targetVec.z - eyeVec.z;
    const length = Math.hypot(dx, dy, dz);

    let lookTarget = targetVec;
    let keepGivenTarget = true;

    if (!Number.isFinite(length) || length < EPS) {
      // A zero-length look direction is ambiguous; use +Z, matching the
      // documented FreeCamera yaw convention.
      lookTarget = { x: eyeVec.x, y: eyeVec.y, z: eyeVec.z + 1 };
      keepGivenTarget = false;
    }

    // Ask the library for its own yaw/pitch convention instead of hard-coding
    // the pitch sign.  attachFreeControl aims from _yaw/_pitch, so we must keep
    // those in sync with the view direction.
    const probe = createFreeCamera(eyeVec, lookTarget);

    let yaw = probe._yaw;
    let pitch = probe._pitch;

    const horizontal = Math.hypot(
      lookTarget.x - eyeVec.x,
      lookTarget.z - eyeVec.z,
    );

    if (!Number.isFinite(yaw)) {
      yaw = Math.atan2(lookTarget.x - eyeVec.x, lookTarget.z - eyeVec.z);
      keepGivenTarget = false;
    }

    if (!Number.isFinite(pitch)) {
      pitch = Math.atan2(lookTarget.y - eyeVec.y, horizontal);
      keepGivenTarget = false;
    }

    // attachFreeControl clamps pitch to roughly +-PI/2.  If we had to clamp,
    // rewrite target one unit ahead along _yaw/_pitch so the next control move
    // carries on from exactly this pose.
    if (pitch > MAX_PITCH) {
      pitch = MAX_PITCH;
      keepGivenTarget = false;
    } else if (pitch < -MAX_PITCH) {
      pitch = -MAX_PITCH;
      keepGivenTarget = false;
    }

    position.x = eyeVec.x;
    position.y = eyeVec.y;
    position.z = eyeVec.z;

    if (keepGivenTarget) {
      targetRef.x = lookTarget.x;
      targetRef.y = lookTarget.y;
      targetRef.z = lookTarget.z;
    } else {
      const cosPitch = Math.cos(pitch);
      targetRef.x = eyeVec.x + Math.sin(yaw) * cosPitch;
      targetRef.y = eyeVec.y + Math.sin(pitch);
      targetRef.z = eyeVec.z + Math.cos(yaw) * cosPitch;
    }

    camera._yaw = yaw;
    camera._pitch = pitch;
  }

  // Make sure the initial pose has the same _yaw/_pitch/target consistency as
  // a jump.
  applyPose(eye, target);

  let disposed = false;
  let detach = attachFreeControl(camera, canvas, scene);

  function jumpTo(nextEye: Vec, nextTarget: Vec): void {
    applyPose(nextEye, nextTarget);

    // If controls are still attached, they resume from the updated _yaw/_pitch
    // and target.  If dispose() has already run, jumpTo only updates the camera
    // pose and does not reattach canvas listeners or frame hooks.
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;

    detach();
    detach = () => {};
  }

  return { camera, jumpTo, dispose };
}
