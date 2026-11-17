import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

function cloneVec(v: Vec): Vec {
  return { x: v.x, y: v.y, z: v.z };
}

function setVec(dest: unknown, src: Vec): void {
  const target = dest as {
    x?: number;
    y?: number;
    z?: number;
    set?: (x: number, y: number, z: number) => void;
  };

  if (typeof target.set === "function") {
    target.set(src.x, src.y, src.z);
  } else {
    target.x = src.x;
    target.y = src.y;
    target.z = src.z;
  }
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function yawPitchFromView(eye: Vec, target: Vec): { yaw: number; pitch: number } {
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dz = target.z - eye.z;
  const horizontal = Math.hypot(dx, dz);

  if (horizontal < 1e-12 && Math.abs(dy) < 1e-12) {
    return { yaw: 0, pitch: 0 };
  }

  return {
    yaw: Math.atan2(dx, dz),
    pitch: Math.atan2(dy, horizontal),
  };
}

function orientationForView(eye: Vec, target: Vec): { yaw: number; pitch: number } {
  try {
    const scratch = createFreeCamera(cloneVec(eye), cloneVec(target));
    if (finiteNumber(scratch._yaw) && finiteNumber(scratch._pitch)) {
      return { yaw: scratch._yaw, pitch: scratch._pitch };
    }
  } catch {
    // Fall back to a standard Y-up computation if the scratch camera is not usable.
  }

  return yawPitchFromView(eye, target);
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera(cloneVec(eye), cloneVec(target));
  scene.camera = camera;

  let detachControls = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  const jumpTo = (newEye: Vec, newTarget: Vec): void => {
    const copiedEye = cloneVec(newEye);
    const copiedTarget = cloneVec(newTarget);

    setVec(camera.position, copiedEye);
    setVec(camera.target, copiedTarget);

    const orientation = orientationForView(copiedEye, copiedTarget);
    camera._yaw = orientation.yaw;
    camera._pitch = orientation.pitch;
  };

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    detachControls();
    detachControls = () => {};
  };

  return { camera, jumpTo, dispose };
}
