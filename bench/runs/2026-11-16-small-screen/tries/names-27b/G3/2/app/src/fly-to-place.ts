import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  let stopped = false;

  const previousCancel = camera._cancelFly;
  if (previousCancel) {
    previousCancel();
  }

  const flight = flyGeospatialCameraToAsync(camera, scene, {
    yaw: place.yaw,
    pitch: place.pitch,
    radius: place.radius,
    center: {
      x: place.center.x,
      y: place.center.y,
      z: place.center.z,
    },
    durationMs: Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0,
  });

  const currentCancel = camera._cancelFly;
  if (currentCancel && currentCancel !== previousCancel) {
    camera._cancelFly = () => {
      stopped = true;
      currentCancel();
    };
  }

  return flight.then(
    () => !stopped,
    () => false
  );
}
