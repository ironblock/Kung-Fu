import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
// ASSUMED: flyGeospatialCameraToAsync is exported by "@babylonjs/lite" with the
// argument order (camera, scene, goal, durationMs). Not verified; the library is not on this machine.
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

const ANGLE_EPS = 1e-4;
const LINEAR_EPS = 1e-4;

// Smallest absolute difference between two angles, allowing for yaw wrapping
// to [-PI, PI) (yaw = PI reads back as -PI).
function angleDelta(a: number, b: number): number {
  const TAU = Math.PI * 2;
  let d = (a - b) % TAU;
  if (d >= Math.PI) d -= TAU;
  else if (d < -Math.PI) d += TAU;
  return Math.abs(d);
}

// The flight's promise resolves both when it finishes and when it is interrupted,
// so arrival is decided by comparing the camera pose with the place afterwards.
function atPlace(camera: GeospatialCamera, place: Place): boolean {
  const radiusTol = LINEAR_EPS * Math.max(1, Math.abs(place.radius));
  const centerTol = LINEAR_EPS * Math.max(1, place.radius);
  return (
    angleDelta(camera.yaw, place.yaw) <= ANGLE_EPS &&
    Math.abs(camera.pitch - place.pitch) <= ANGLE_EPS &&
    Math.abs(camera.radius - place.radius) <= radiusTol &&
    Math.abs(camera.center.x - place.center.x) <= centerTol &&
    Math.abs(camera.center.y - place.center.y) <= centerTol &&
    Math.abs(camera.center.z - place.center.z) <= centerTol
  );
}

export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  try {
    // Fresh center object so the library re-orbits to the new center (see note 10).
    // Radius is part of the goal; the library's pitch clamp depends on radius (note 5).
    await flyGeospatialCameraToAsync(
      camera,
      scene,
      {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: { x: place.center.x, y: place.center.y, z: place.center.z },
      },
      durationMs,
    );
  } catch {
    return false;
  }
  return atPlace(camera, place);
}
