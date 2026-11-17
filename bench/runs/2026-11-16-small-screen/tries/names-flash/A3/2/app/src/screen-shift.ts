import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

type PixelViewport = { x: number; y: number; width: number; height: number };

type ScreenOptions = {
  viewport: PixelViewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin?: Vec;
};

type Snapshot = {
  view: Float32Array;
  viewProjection: Float32Array;
  options: ScreenOptions;
  valid: boolean;
};

type ScreenPoint = {
  x: number;
  y: number;
  valid: boolean;
};

function isFiniteNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function asFiniteVec(value: unknown): Vec | undefined {
  try {
    if (!value || typeof value !== "object") return undefined;

    const vector = value as Vec;
    if (isFiniteNumber(vector.x) && isFiniteNumber(vector.y) && isFiniteNumber(vector.z)) {
      return { x: vector.x, y: vector.y, z: vector.z };
    }

    const arrayLike = value as ArrayLike<number>;
    if (typeof arrayLike.length === "number" && arrayLike.length >= 3) {
      const x = Number(arrayLike[0]);
      const y = Number(arrayLike[1]);
      const z = Number(arrayLike[2]);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        return { x, y, z };
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function isValidViewport(value: unknown): value is PixelViewport {
  try {
    if (!value || typeof value !== "object") return false;

    const viewport = value as PixelViewport;
    return (
      isFiniteNumber(viewport.x) &&
      isFiniteNumber(viewport.y) &&
      isFiniteNumber(viewport.width) &&
      isFiniteNumber(viewport.height) &&
      viewport.width > 0 &&
      viewport.height > 0
    );
  } catch {
    return false;
  }
}

function isNonZeroMatrix(matrix: Float32Array): boolean {
  for (let i = 0; i < matrix.length; i++) {
    const value = matrix[i];
    if (Number.isFinite(value) && value !== 0) return true;
  }
  return false;
}

function copyMatrix(source: unknown): Float32Array {
  const out = new Float32Array(16);

  try {
    const candidate = source as any;
    const arrayLike =
      typeof candidate.length === "number"
        ? candidate
        : candidate.m && typeof candidate.m.length === "number"
          ? candidate.m
          : null;

    if (arrayLike && typeof arrayLike.length === "number") {
      const length = Math.min(16, arrayLike.length);
      for (let i = 0; i < length; i++) {
        const value = Number(arrayLike[i]);
        if (Number.isFinite(value)) out[i] = value;
      }
    }
  } catch {
    // Leave the output zero-filled; callers treat all-zero matrices as invalid.
  }

  return out;
}

function safeCall<T>(operation: () => T, fallback: T): T {
  try {
    return operation();
  } catch {
    return fallback;
  }
}

function safeMatrix(getMatrix: () => unknown, fallback: unknown): Float32Array {
  const source = safeCall(getMatrix, fallback);
  return copyMatrix(source ?? fallback);
}

function getDevicePixelRatio(): number {
  if (typeof window !== "undefined" && typeof window.devicePixelRatio === "number" && window.devicePixelRatio > 0) {
    return window.devicePixelRatio;
  }
  return 1;
}

function canvasSizes(canvas: HTMLCanvasElement): {
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
} {
  try {
    const dpr = getDevicePixelRatio();

    let cssWidth = 0;
    let cssHeight = 0;

    try {
      const rect = canvas.getBoundingClientRect();
      cssWidth = rect.width;
      cssHeight = rect.height;
    } catch {
      cssWidth = 0;
      cssHeight = 0;
    }

    if (!isFiniteNumber(cssWidth) || cssWidth <= 0) {
      cssWidth = canvas.clientWidth || canvas.offsetWidth || 0;
    }
    if (!isFiniteNumber(cssHeight) || cssHeight <= 0) {
      cssHeight = canvas.clientHeight || canvas.offsetHeight || 0;
    }

    let backingWidth = canvas.width;
    let backingHeight = canvas.height;

    if (!isFiniteNumber(backingWidth) || backingWidth <= 0) {
      backingWidth = Math.max(1, Math.round(cssWidth * dpr));
    }
    if (!isFiniteNumber(backingHeight) || backingHeight <= 0) {
      backingHeight = Math.max(1, Math.round(cssHeight * dpr));
    }

    if (!isFiniteNumber(backingWidth) || backingWidth <= 0) backingWidth = 1;
    if (!isFiniteNumber(backingHeight) || backingHeight <= 0) backingHeight = 1;

    if (!isFiniteNumber(cssWidth) || cssWidth <= 0) {
      cssWidth = backingWidth / dpr;
    }
    if (!isFiniteNumber(cssHeight) || cssHeight <= 0) {
      cssHeight = backingHeight / dpr;
    }

    if (!isFiniteNumber(cssWidth) || cssWidth <= 0) cssWidth = 1;
    if (!isFiniteNumber(cssHeight) || cssHeight <= 0) cssHeight = 1;

    return {
      backingWidth: Math.max(1, backingWidth),
      backingHeight: Math.max(1, backingHeight),
      cssWidth: Math.max(1, cssWidth),
      cssHeight: Math.max(1, cssHeight),
    };
  } catch {
    return {
      backingWidth: 1,
      backingHeight: 1,
      cssWidth: 1,
      cssHeight: 1,
    };
  }
}

function viewportFromCamera(
  camera: Camera,
  backingWidth: number,
  backingHeight: number,
): PixelViewport {
  try {
    const normalized = (camera as any).viewport;

    if (normalized && typeof normalized === "object") {
      const x = normalized.x;
      const y = normalized.y;
      const width = normalized.width;
      const height = normalized.height;

      if (
        isFiniteNumber(x) &&
        isFiniteNumber(y) &&
        isFiniteNumber(width) &&
        isFiniteNumber(height) &&
        width > 0 &&
        height > 0
      ) {
        return {
          x: x * backingWidth,
          y: y * backingHeight,
          width: width * backingWidth,
          height: height * backingHeight,
        };
      }
    }
  } catch {
    // Fall back to the full viewport below.
  }

  return {
    x: 0,
    y: 0,
    width: backingWidth,
    height: backingHeight,
  };
}

function safeAspectRatio(camera: Camera, backingWidth: number, backingHeight: number): number {
  let aspect = safeCall(() => getEffectiveAspectRatio(camera, backingWidth, backingHeight), Number.NaN);

  if (!isFiniteNumber(aspect) || aspect <= 0) {
    let cachedAspect = Number.NaN;
    try {
      cachedAspect = (camera as any)._projAspect;
    } catch {
      cachedAspect = Number.NaN;
    }

    if (isFiniteNumber(cachedAspect) && cachedAspect > 0) {
      aspect = cachedAspect;
    } else {
      aspect = backingWidth / backingHeight;
    }
  }

  if (!isFiniteNumber(aspect) || aspect <= 0) {
    aspect = 1;
  }

  return aspect;
}

function safeViewport(camera: Camera, backingWidth: number, backingHeight: number): PixelViewport {
  let viewport = safeCall(
    () => resolveCameraViewport(camera, backingWidth, backingHeight) as PixelViewport,
    undefined,
  );

  if (!isValidViewport(viewport)) {
    viewport = viewportFromCamera(camera, backingWidth, backingHeight);
  }

  return viewport;
}

function worldOriginFor(camera: Camera): Vec | undefined {
  try {
    const cam = camera as any;

    if (cam._useFloatingOrigin !== true) return undefined;

    const candidates = [
      cam._floatingOrigin,
      cam.worldOrigin,
      cam._worldOrigin,
      cam.origin,
      cam._origin,
    ];

    for (const candidate of candidates) {
      const vector = asFiniteVec(candidate);
      if (vector) return vector;
    }

    const position = safeCall(() => getCameraPosition(camera), undefined);
    return asFiniteVec(position);
  } catch {
    return undefined;
  }
}

function createSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const sizes = canvasSizes(canvas);
  const aspect = safeAspectRatio(camera, sizes.backingWidth, sizes.backingHeight);
  const viewport = safeViewport(camera, sizes.backingWidth, sizes.backingHeight);

  const viewFallback = safeCall(() => (camera as any).worldMatrix, undefined);
  const view = safeMatrix(() => getViewMatrix(camera), viewFallback);

  const viewProjectionFallback = safeCall(() => (camera as any)._vpCache, undefined);
  const viewProjection = safeMatrix(
    () => getViewProjectionMatrix(camera, aspect),
    viewProjectionFallback,
  );

  const options: ScreenOptions = {
    viewport,
    backingWidth: sizes.backingWidth,
    backingHeight: sizes.backingHeight,
    cssWidth: sizes.cssWidth,
    cssHeight: sizes.cssHeight,
  };

  const worldOrigin = worldOriginFor(camera);
  if (worldOrigin) options.worldOrigin = worldOrigin;

  const valid = isNonZeroMatrix(view) && isNonZeroMatrix(viewProjection);

  return {
    view,
    viewProjection,
    options,
    valid,
  };
}

function emptySnapshot(): Snapshot {
  return {
    view: new Float32Array(16),
    viewProjection: new Float32Array(16),
    options: {
      viewport: { x: 0, y: 0, width: 1, height: 1 },
      backingWidth: 1,
      backingHeight: 1,
      cssWidth: 1,
      cssHeight: 1,
    },
    valid: false,
  };
}

function screenPoint(point: Vec, snapshot: Snapshot): ScreenPoint {
  if (!snapshot.valid) {
    return { x: 0, y: 0, valid: false };
  }

  try {
    const result = safeCall(
      () =>
        projectWorldToScreen(
          point as any,
          snapshot.view as any,
          snapshot.viewProjection as any,
          snapshot.options as any,
        ),
      undefined,
    );

    if (!result || typeof result !== "object") {
      return { x: 0, y: 0, valid: false };
    }

    const projected = result as any;
    const cssX = projected.cssX;
    const cssY = projected.cssY;

    if (!isFiniteNumber(cssX) || !isFiniteNumber(cssY)) {
      return { x: 0, y: 0, valid: false };
    }

    if (projected.behindCamera === true) {
      return { x: 0, y: 0, valid: false };
    }

    const clipW = projected.clipW;
    if (clipW !== undefined && (!isFiniteNumber(clipW) || clipW <= 0)) {
      return { x: 0, y: 0, valid: false };
    }

    return { x: cssX, y: cssY, valid: true };
  } catch {
    return { x: 0, y: 0, valid: false };
  }
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let lastSnapshot: Snapshot;

  try {
    lastSnapshot = createSnapshot(camera, canvas);
  } catch {
    lastSnapshot = emptySnapshot();
  }

  return {
    mark(): void {
      try {
        lastSnapshot = createSnapshot(camera, canvas);
      } catch {
        // If snapshotting fails, keep the previous mark rather than clearing it.
      }
    },

    shift(point: Vec): { dx: number; dy: number } {
      const vector = asFiniteVec(point);
      if (!vector) {
        return { dx: 0, dy: 0 };
      }

      let currentSnapshot: Snapshot;
      try {
        currentSnapshot = createSnapshot(camera, canvas);
      } catch {
        return { dx: 0, dy: 0 };
      }

      const before = screenPoint(vector, lastSnapshot);
      const after = screenPoint(vector, currentSnapshot);

      if (!before.valid || !after.valid) {
        return { dx: 0, dy: 0 };
      }

      let dx = after.x - before.x;
      let dy = after.y - before.y;

      if (!isFiniteNumber(dx)) dx = 0;
      if (!isFiniteNumber(dy)) dy = 0;

      return { dx, dy };
    },
  };
}
