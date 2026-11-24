import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the tilt of a GeospatialCamera, in radians, measured from looking
 * straight down at the ground (0) toward the horizon.
 *
 * Only `pitch` is written. Radius (zoom), yaw (heading) and center are left as
 * they are. The library clamps pitch to the maximum allowed at the current
 * radius, so if the requested tilt is not allowed at this zoom, this throws
 * rather than leaving the camera at a different tilt than asked for.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
  }

  camera.pitch = pitch;

  if (camera.pitch !== pitch) {
    throw new Error(
      `tiltGlobeCamera: requested pitch ${pitch} was clamped to ${camera.pitch} ` +
        `at radius ${camera.radius}; the tilt is not allowed at this zoom`
    );
  }
}
