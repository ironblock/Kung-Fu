import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-6;

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
  return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec {
  const l = length(a);
  if (l < EPS) {
    return { x: 0, y: 0, z: 0 };
  }
  return scale(a, 1 / l);
}

function projectToPlane(v: Vec, planeNormal: Vec): Vec {
  const p = sub(v, scale(planeNormal, dot(v, planeNormal)));
  const l = length(p);
  if (l < EPS) {
    return { x: 0, y: 0, z: 0 };
  }
  return scale(p, 1 / l);
}

function writeVec(target: { x: number; y: number; z: number }, source: Vec): void {
  const t = target as { copyFrom?: (v: Vec) => void };
  if (typeof t.copyFrom === "function") {
    t.copyFrom(source);
  } else {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
  }
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const initialForward = normalize(sub(target, eye));
  let initialUp: Vec = { x: 0, y: 1, z: 0 };

  if (length(initialForward) >= EPS) {
    const worldUp = projectToPlane({ x: 0, y: 1, z: 0 }, initialForward);
    if (length(worldUp) >= EPS) {
      initialUp = worldUp;
    } else {
      const worldX = projectToPlane({ x: 1, y: 0, z: 0 }, initialForward);
      if (length(worldX) >= EPS) {
        initialUp = worldX;
      }
    }
  }

  const camera = createBankedFreeCamera(eye, target, initialUp);

  const applyUp = (up: Vec): void => {
    writeVec(camera.upVector, up);
    camera._viewVer = -1;
  };

  applyUp(initialUp);

  const bank = (up: Vec): void => {
    const forward = normalize(
      sub(
        { x: camera.target.x, y: camera.target.y, z: camera.target.z },
        { x: camera.position.x, y: camera.position.y, z: camera.position.z }
      )
    );

    if (length(forward) < EPS) {
      return;
    }

    const normalizedUp = normalize(up);
    if (length(normalizedUp) < EPS) {
      return;
    }

    const desired = projectToPlane(normalizedUp, forward);
    if (length(desired) >= EPS) {
      applyUp(desired);
      return;
    }

    const previous = projectToPlane(
      { x: camera.upVector.x, y: camera.upVector.y, z: camera.upVector.z },
      forward
    );
    if (length(previous) >= EPS) {
      applyUp(previous);
      return;
    }

    const worldUp = projectToPlane({ x: 0, y: 1, z: 0 }, forward);
    if (length(worldUp) >= EPS) {
      applyUp(worldUp);
      return;
    }

    const worldX = projectToPlane({ x: 1, y: 0, z: 0 }, forward);
    if (length(worldX) >= EPS) {
      applyUp(worldX);
      return;
    }

    applyUp({ x: 0, y: 1, z: 0 });
  };

  return { camera, bank };
}
