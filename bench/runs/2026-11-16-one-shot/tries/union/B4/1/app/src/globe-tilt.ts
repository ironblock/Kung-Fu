import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the camera's pitch (radians from straight down: 0 = nadir, toward the
 * horizon as it grows) while keeping its yaw, radius and centre unchanged.
 * Also removes the radius-dependent pitch restriction so the tilt holds when
 * the camera is later moved nearer to or farther from the globe.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`pitch must be a finite number, got ${pitch}`);
  }

  const limits = camera.limits;
  if (pitch < limits.pitchMin || pitch > limits.pitchMax) {
    throw new RangeError(
      `pitch ${pitch} is outside the camera's limits [${limits.pitchMin}, ${limits.pitchMax}]`,
    );
  }

  // With default limits, pitch is forced toward pitchMin as the radius grows
  // past 2 * planetRadius, which would undo the tilt at the start zoom (4R) and
  // at any farther zoom. null allows full pitch at any radius. Set it before
  // writing pitch so the write is not clamped.
  limits.pitchDisabledRadiusScale = null;

  // Writing pitch changes only the orbit angle. Yaw, radius and centre are not
  // touched, so the zoom and centre stay where they are.
  camera.pitch = pitch;
}
