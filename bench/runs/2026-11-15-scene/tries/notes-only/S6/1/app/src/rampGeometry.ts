// Pure geometry for the loading ramp. No library imports, so it can be tested on its own.
//
// Layout (y up, z forward, x right):
//   base:   y = 0, x in [-w/2, w/2], z in [0, L]
//   top:    slopes from (z = 0, y = 0) up to (z = L, y = H)
//   back:   vertical face at z = L, from y = 0 to y = H
//   sides:  two triangles at x = -w/2 and x = +w/2
//
// Flat shading: every face gets its own vertices, all carrying that face's normal.
// Each triangle is wound so that cross(p1 - p0, p2 - p0) points along the face's
// outward normal. This is the convention that the Babylon default (clockwise
// front faces, left-handed system) expects, which I could not verify here.

export interface RampGeometry {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

type V3 = readonly [number, number, number];

function sub(a: V3, b: V3): V3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: V3, b: V3): V3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(a: V3): V3 {
  const len = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / len, a[1] / len, a[2] / len];
}

interface Builder {
  positions: number[];
  normals: number[];
  indices: number[];
}

/**
 * Adds one flat face. `corners` is a convex polygon in order; it is fan-triangulated
 * from corner 0. Each triangle is flipped if needed so its winding agrees with `normal`.
 */
function addFace(b: Builder, corners: V3[], normal: V3): void {
  const base = b.positions.length / 3;
  for (const p of corners) {
    b.positions.push(p[0], p[1], p[2]);
    b.normals.push(normal[0], normal[1], normal[2]);
  }
  for (let i = 1; i < corners.length - 1; i++) {
    let i1 = base + i;
    let i2 = base + i + 1;
    const n = cross(sub(corners[i], corners[0]), sub(corners[i + 1], corners[0]));
    if (dot(n, normal) < 0) {
      const t = i1;
      i1 = i2;
      i2 = t;
    }
    b.indices.push(base, i1, i2);
  }
}

export function buildRampGeometry(width: number, length: number, height: number): RampGeometry {
  if (!(width > 0 && length > 0 && height > 0)) {
    throw new RangeError("ramp width, length and height must all be positive");
  }

  const hw = width / 2;
  const L = length;
  const H = height;
  const b: Builder = { positions: [], normals: [], indices: [] };

  // Base, y = 0, facing down.
  addFace(
    b,
    [
      [-hw, 0, 0],
      [hw, 0, 0],
      [hw, 0, L],
      [-hw, 0, L],
    ],
    [0, -1, 0],
  );

  // Sloped top. Its normal is perpendicular to the slope direction (0, H, L) and points up and forward.
  addFace(
    b,
    [
      [-hw, 0, 0],
      [hw, 0, 0],
      [hw, H, L],
      [-hw, H, L],
    ],
    normalize([0, L, -H]),
  );

  // Vertical back face at z = L, facing +z.
  addFace(
    b,
    [
      [hw, 0, L],
      [hw, H, L],
      [-hw, H, L],
      [-hw, 0, L],
    ],
    [0, 0, 1],
  );

  // Right triangular side, x = +w/2, facing +x.
  addFace(
    b,
    [
      [hw, 0, 0],
      [hw, 0, L],
      [hw, H, L],
    ],
    [1, 0, 0],
  );

  // Left triangular side, x = -w/2, facing -x.
  addFace(
    b,
    [
      [-hw, 0, 0],
      [-hw, 0, L],
      [-hw, H, L],
    ],
    [-1, 0, 0],
  );

  return {
    positions: new Float32Array(b.positions),
    normals: new Float32Array(b.normals),
    indices: new Uint32Array(b.indices),
  };
}
