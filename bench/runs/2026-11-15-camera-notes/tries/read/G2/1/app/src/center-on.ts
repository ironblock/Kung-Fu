import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees), on the sphere of radius `camera.limits.planetRadius` centred
 * at the origin. Yaw, pitch and radius are kept as they are.
 *
 * Axes, as the library defines them: +Z is north, and lat 0 / lon 0 is on +X
 * (where a new camera is centred). East is -Y there: the library is left-handed,
 * so a viewer facing north with up = +X has east on their right, and
 * right = up x forward gives X x Z = -Y. Heading 90 (east) therefore looks
 * toward increasing longitude.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const radius = camera.limits.planetRadius;
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const cosLat = Math.cos(lat);

  const center: Vec3 = {
    x: radius * cosLat * Math.cos(lon),
    y: -radius * cosLat * Math.sin(lon),
    z: radius * Math.sin(lat),
  };

  // A running flight would keep writing its own centre and undo this move.
  camera._cancelFly?.();

  // One orientation write, so limits are applied once with the new centre.
  setGeospatialOrientation(camera, {
    yaw: camera.yaw,
    pitch: camera.pitch,
    radius: camera.radius,
    center,
  });
}
