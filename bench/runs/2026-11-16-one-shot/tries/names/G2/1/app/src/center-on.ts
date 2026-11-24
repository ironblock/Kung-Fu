import {
  computeLocalBasis,
  createGeospatialCamera,
  setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

const DEG_TO_RAD = Math.PI / 180;

function zeroVec(): Vec3Like {
  return { x: 0, y: 0, z: 0 };
}

function normalizeInPlace(v: Vec3Like): void {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len > 0) {
    v.x /= len;
    v.y /= len;
    v.z /= len;
  }
}

/**
 * Moves the camera's centre to the surface point at the given latitude and
 * longitude. Yaw, pitch and radius are left unchanged.
 *
 * The east, north and up directions are taken from the library itself, using
 * a freshly created camera (which is centred on latitude 0, longitude 0). This
 * keeps the lat/lon frame consistent with the camera's own north and east.
 */
export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const planetRadius = camera.limits.planetRadius;

  // Local basis at lat 0, lon 0 as the library defines it.
  const probe = createGeospatialCamera({ planetRadius });
  const up = zeroVec();
  const east = zeroVec();
  const north = zeroVec();
  computeLocalBasis(probe.center, east, north, up);
  normalizeInPlace(up);
  normalizeInPlace(east);
  normalizeInPlace(north);

  // Unit direction of the target point, expressed in that basis:
  //   p = cos(lat)cos(lon)·up + cos(lat)sin(lon)·east + sin(lat)·north
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const cosLat = Math.cos(lat);
  const wUp = cosLat * Math.cos(lon);
  const wEast = cosLat * Math.sin(lon);
  const wNorth = Math.sin(lat);

  const center: Vec3Like = {
    x: planetRadius * (wUp * up.x + wEast * east.x + wNorth * north.x),
    y: planetRadius * (wUp * up.y + wEast * east.y + wNorth * north.y),
    z: planetRadius * (wUp * up.z + wEast * east.z + wNorth * north.z),
  };

  setGeospatialOrientation(camera, {
    center: center as GeospatialCamera["center"],
    yaw: camera.yaw,
    pitch: camera.pitch,
    radius: camera.radius,
  });
}
