import {
  computeLocalBasis,
  createGeospatialCamera,
  setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function unit(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Moves the camera's centre to the surface point at the given latitude and
 * longitude (degrees). Zoom (radius), heading (yaw) and tilt (pitch) are kept.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const planetRadius = camera.limits.planetRadius;

  // A freshly created camera is centred on lat 0, lon 0. Its local basis gives
  // the camera's own east and north at that point, which defines the frame
  // used for every other latitude and longitude.
  const reference = createGeospatialCamera({ planetRadius });
  const origin = reference.center;
  const east: Vec3 = { x: 0, y: 0, z: 0 };
  const north: Vec3 = { x: 0, y: 0, z: 0 };
  const up: Vec3 = { x: 0, y: 0, z: 0 };
  computeLocalBasis(origin, east, north, up);

  // Orthonormal frame: X towards lat 0 lon 0, Y towards lon 90 east, Z towards the north pole.
  const X = unit(origin);
  const Y = unit(east);
  const northPerp = {
    x: north.x - X.x * dot(north, X),
    y: north.y - X.y * dot(north, X),
    z: north.z - X.z * dot(north, X),
  };
  const Z = unit(northPerp);

  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const cLat = Math.cos(lat);
  const sLat = Math.sin(lat);
  const cLon = Math.cos(lon);
  const sLon = Math.sin(lon);

  const a = cLat * cLon;
  const b = cLat * sLon;
  const c = sLat;

  const center: Vec3 = {
    x: planetRadius * (a * X.x + b * Y.x + c * Z.x),
    y: planetRadius * (a * X.y + b * Y.y + c * Z.y),
    z: planetRadius * (a * X.z + b * Y.z + c * Z.z),
  };

  setGeospatialOrientation(camera, {
    yaw: camera.yaw,
    pitch: camera.pitch,
    radius: camera.radius,
    center,
  });
}
