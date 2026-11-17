import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

const EPS = 1e-6;
const PITCH_CLAMP_MARGIN = 0.01;
const MIN_H = Math.tan(PITCH_CLAMP_MARGIN) + 1e-4;

function finite(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

function sanitizeVec(v: Vec): Vec {
  return { x: finite(v.x), y: finite(v.y), z: finite(v.z) };
}

function orientationTarget(eye: Vec, target: Vec, fallbackYaw?: number): Vec {
  const e = sanitizeVec(eye);
  const t = sanitizeVec(target);
  const dx = t.x - e.x;
  const dy = t.y - e.y;
  const dz = t.z - e.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (!Number.isFinite(len) || len < EPS) {
    return { x: e.x, y: e.y, z: e.z + 1 };
  }

  const nx = dx / len;
  const ny = dy / len;
  const nz = dz / len;
  const horizontal = Math.sqrt(nx * nx + nz * nz);

  // FreeCamera pitch is clamped around +- (PI/2 - 0.01), and a target exactly
  // parallel to world Y is degenerate for the basis. Keep near-vertical poses
  // slightly off that axis so mouse/keyboard controls continue to work.
  if (horizontal < MIN_H && Math.abs(ny) > EPS) {
    const yaw = horizontal > EPS
      ? Math.atan2(nx, nz)
      : (Number.isFinite(fallbackYaw) ? fallbackYaw : 0);
    const vertical = Math.sqrt(Math.max(0, 1 - MIN_H * MIN_H));
    const verticalSign = ny >= 0 ? 1 : -1;

    return {
      x: e.x + MIN_H * Math.sin(yaw),
      y: e.y + verticalSign * vertical,
      z: e.z + MIN_H * Math.cos(yaw),
    };
  }

  return t;
}

function applyVec3(vec: any, source: Vec): void {
  if (!vec) return;

  const x = finite(source.x);
  const y = finite(source.y);
  const z = finite(source.z);

  let applied = false;

  try {
    if (typeof vec.set === "function") {
      vec.set(x, y, z);
      applied = true;
    }
  } catch {
    applied = false;
  }

  if (!applied) {
    try {
      if (typeof vec.copyFrom === "function") {
        vec.copyFrom({ x, y, z });
        applied = true;
      }
    } catch {
      applied = false;
    }
  }

  if (!applied) {
    try {
      vec.x = x;
      vec.y = y;
      vec.z = z;
    } catch {
      // fall through
    }
  }

  // Some observable vectors only become dirty through component setters.
  try {
    vec.x = x;
    vec.y = y;
    vec.z = z;
  } catch {
    // ignore if components are not directly writable
  }

  if (typeof vec.markDirty === "function") {
    try {
      vec.markDirty();
    } catch {
      // ignore
    }
  }
}

function applyPose(camera: FreeCamera, eye: Vec, target: Vec): void {
  const e = sanitizeVec(eye);
  const t = orientationTarget(e, target, camera._yaw);

  // Use a throwaway camera to get the same _yaw/_pitch convention that
  // createFreeCamera uses, then copy it into the live camera.
  const pose = createFreeCamera(e as any, t as any);

  applyVec3(camera.position, e);
  applyVec3(camera.target, t);

  let yaw = pose._yaw;
  let pitch = pose._pitch;

  if (!Number.isFinite(yaw)) {
    yaw = Number.isFinite(camera._yaw) ? camera._yaw : 0;
  }
  if (!Number.isFinite(pitch)) {
    pitch = 0;
  }

  const maxPitch = Math.PI / 2 - PITCH_CLAMP_MARGIN;
  if (pitch > maxPitch) pitch = maxPitch;
  else if (pitch < -maxPitch) pitch = -maxPitch;

  camera._yaw = yaw;
  camera._pitch = pitch;

  const cam = camera as any;
  if (typeof cam.markDirty === "function") {
    try {
      cam.markDirty();
    } catch {
      // ignore
    }
  }
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const sceneArg = scene as SceneContext | undefined;

  const startEye = sanitizeVec(eye);
  const startTarget = orientationTarget(startEye, target);
  const camera = createFreeCamera(startEye as any, startTarget as any);

  if (sceneArg) {
    (sceneArg as any).camera = camera;
  }

  const originalTabIndex = canvas.getAttribute("tabindex");
  const hadTabIndex = originalTabIndex !== null && originalTabIndex !== "";

  const attachControls = (): () => void => {
    try {
      const cleanup = attachFreeControl(camera, canvas, sceneArg);
      return typeof cleanup === "function" ? cleanup : () => {};
    } catch {
      return () => {};
    }
  };

  let disposed = false;
  let detach = attachControls();

  const focusCanvas = (): void => {
    const focus = (canvas as any).focus;
    if (typeof focus === "function") {
      try {
        focus.call(canvas, { preventScroll: true });
      } catch {
        try {
          focus.call(canvas);
        } catch {
          // ignore
        }
      }
    }
  };

  const jumpTo = (eye: Vec, target: Vec): void => {
    applyPose(camera, eye, target);

    if (disposed) return;

    // Re-attach controls so any residual drag coast from the previous view is
    // cleared and the keyboard/mouse controls start from the new pose.
    try {
      detach();
    } catch {
      // ignore
    }

    detach = attachControls();

    // The library listens for keys on the canvas, so bring focus back to it
    // after viewpoint buttons move focus away.
    focusCanvas();
  };

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;

    try {
      detach();
    } catch {
      // ignore
    }

    if (!hadTabIndex && canvas.getAttribute("tabindex") === "0") {
      canvas.removeAttribute("tabindex");
    } else if (
      hadTabIndex &&
      originalTabIndex !== null &&
      canvas.getAttribute("tabindex") !== originalTabIndex
    ) {
      canvas.setAttribute("tabindex", originalTabIndex);
    }
  };

  return { camera, jumpTo, dispose };
}
