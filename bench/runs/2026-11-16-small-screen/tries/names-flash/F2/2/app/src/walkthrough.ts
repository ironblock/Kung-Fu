import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

export type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

type CameraPositionArg = Parameters<typeof createFreeCamera>[0];
type CameraTargetArg = Parameters<typeof createFreeCamera>[1];

function asCameraPosition(value: Vec): CameraPositionArg {
  return value as unknown as CameraPositionArg;
}

function asCameraTarget(value: Vec): CameraTargetArg {
  return value as unknown as CameraTargetArg;
}

function assignVector(target: unknown, source: Vec): void {
  const vector = target as {
    set?: (x: number, y: number, z: number) => void;
    copyFrom?: (value: Vec) => void;
    x?: number;
    y?: number;
    z?: number;
  };

  if (typeof vector.set === "function") {
    vector.set(source.x, source.y, source.z);
    return;
  }

  if (typeof vector.copyFrom === "function") {
    vector.copyFrom(source);
    return;
  }

  vector.x = source.x;
  vector.y = source.y;
  vector.z = source.z;
}

function setSceneCamera(scene: SceneContext, camera: FreeCamera): void {
  (scene as unknown as { camera: FreeCamera }).camera = camera;
}

function applyCameraPose(camera: FreeCamera, eye: Vec, target: Vec): void {
  assignVector(camera.position, eye);
  assignVector(camera.target, target);

  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dz = target.z - eye.z;

  // If the requested look direction is effectively zero, leave the existing
  // orientation alone rather than copying possibly NaN yaw/pitch.
  if (dx * dx + dy * dy + dz * dz > 1e-12) {
    const oriented = createFreeCamera(asCameraPosition(eye), asCameraTarget(target));

    if (Number.isFinite(oriented._yaw)) {
      camera._yaw = oriented._yaw;
    }

    if (Number.isFinite(oriented._pitch)) {
      camera._pitch = oriented._pitch;
    }
  }
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera(asCameraPosition(eye), asCameraTarget(target));

  const attachControls = (): (() => void) => {
    setSceneCamera(scene, camera);
    return attachFreeControl(camera, canvas, scene);
  };

  let disposeControls = attachControls();
  let disposed = false;

  return {
    camera,

    jumpTo(eye: Vec, target: Vec): void {
      applyCameraPose(camera, eye, target);

      if (disposed) {
        // Keep the camera available if the caller wants to move it after
        // removing the interactive controls, but do not re-add listeners.
        setSceneCamera(scene, camera);
        return;
      }

      // Re-attach the library controls so stale keyboard/mouse state does not
      // carry over from the previous viewpoint.
      disposeControls();
      disposeControls = attachControls();
    },

    dispose(): void {
      if (disposed) {
        return;
      }

      disposed = true;
      disposeControls();
    },
  };
}
