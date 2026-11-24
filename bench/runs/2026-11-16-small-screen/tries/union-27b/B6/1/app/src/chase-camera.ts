import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-12;

function normalizeTo(out: Vec, v: Vec): boolean {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len <= EPS) {
    return false;
  }
  out.x = v.x / len;
  out.y = v.y / len;
  out.z = v.z / len;
  return true;
}

function getForward(camera: FreeCamera, out: Vec): boolean {
  const cam = camera as unknown as { position?: Vec; target?: Vec };
  const pos = cam.position;
  const tgt = cam.target;
  if (!pos || !tgt) {
    return false;
  }
  out.x = tgt.x - pos.x;
  out.y = tgt.y - pos.y;
  out.z = tgt.z - pos.z;
  return normalizeTo(out, out);
}

function writeUp(camera: FreeCamera, up: Vec): void {
  const cam = camera as unknown as { upVector?: Vec };
  const uv = cam.upVector;
  if (!uv) {
    return;
  }
  uv.x = up.x;
  uv.y = up.y;
  uv.z = up.z;
}

function isParallel(up: Vec, forward: Vec): boolean {
  const dot = up.x * forward.x + up.y * forward.y + up.z * forward.z;
  const px = up.x - forward.x * dot;
  const py = up.y - forward.y * dot;
  const pz = up.z - forward.z * dot;
  return Math.hypot(px, py, pz) <= EPS;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  // If the initial line of sight is parallel to world +Y, "upright" is undefined.
  // Choose a stable non-parallel up so the camera can still look at the target.
  const forward: Vec = { x: 0, y: 0, z: 0 };
  if (getForward(camera, forward)) {
    const worldUp: Vec = { x: 0, y: 1, z: 0 };
    if (isParallel(worldUp, forward)) {
      const up: Vec = { x: 0, y: 0, z: 0 };
      const ax = Math.abs(forward.x);
      const ay = Math.abs(forward.y);
      const az = Math.abs(forward.z);

      if (ax <= ay && ax <= az) {
        up.x = 1;
        up.y = 0;
        up.z = 0;
      } else if (ay <= ax && ay <= az) {
        up.x = 0;
        up.y = 1;
        up.z = 0;
      } else {
        up.x = 0;
        up.y = 0;
        up.z = 1;
      }

      const dot = up.x * forward.x + up.y * forward.y + up.z * forward.z;
      up.x -= forward.x * dot;
      up.y -= forward.y * dot;
      up.z -= forward.z * dot;

      if (normalizeTo(up, up)) {
        writeUp(camera, up);
      }
    }
  }

  const bank = (up: Vec): void => {
    const forward: Vec = { x: 0, y: 0, z: 0 };
    if (!getForward(camera, forward)) {
      return;
    }

    const u: Vec = { x: up.x, y: up.y, z: up.z };
    if (!normalizeTo(u, u)) {
      return;
    }

    // If the car's up is along the line of sight, there is no valid roll
    // direction; keep the previous roll by not writing the up vector.
    if (isParallel(u, forward)) {
      return;
    }

    writeUp(camera, u);
  };

  return { camera, bank };
}
