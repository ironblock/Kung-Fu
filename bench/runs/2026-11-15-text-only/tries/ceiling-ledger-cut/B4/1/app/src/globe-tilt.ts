import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians (0 = looking straight down,
 * towards the horizon as it grows) without changing zoom (radius), heading
 * (yaw) or centre.
 *
 * Notes from camera-ledger.toml (row "geospatial: change it through
 * orientation", an unchecked note):
 *  - centre/position/upVector are plain objects, so the tilt must go through
 *    the `pitch` setter (or setGeospatialOrientation), which runs the internal
 *    recompute that also rebuilds position and the matrix.
 *  - That recompute clamps the angles and radius to `camera.limits`, and limit
 *    changes only take effect at the next orientation change. So the limits
 *    are widened first, then pitch is set. Because the widened limits stay in
 *    place, later radius changes (zooming) re-clamp against limits that allow
 *    this pitch, so the tilt holds at every zoom, including fully zoomed out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be finite, got ${pitch}`);
    }

    const cam = camera as unknown as LooseGeospatialCamera;

    const before = {
        yaw: cam.yaw,
        radius: cam.radius,
        center: copyVec(cam.center),
    };

    widenPitchLimits(cam.limits, pitch);

    // Goes through the camera's recompute (position + matrix are rebuilt).
    cam.pitch = pitch;

    // Check that we really got there and nothing else moved.
    const eps = 1e-6;
    if (Math.abs(cam.pitch - pitch) > eps) {
        throw new Error(
            `tiltGlobeCamera: camera clamped pitch to ${cam.pitch} (asked for ${pitch}); ` +
                "camera.limits still restricts pitch at this zoom",
        );
    }
    if (Math.abs(cam.radius - before.radius) > eps * Math.max(1, Math.abs(before.radius))) {
        throw new Error("tiltGlobeCamera: radius changed while tilting");
    }
    if (Math.abs(cam.yaw - before.yaw) > eps) {
        throw new Error("tiltGlobeCamera: yaw changed while tilting");
    }
    const c = cam.center;
    const scale = Math.max(1, Math.hypot(before.center.x, before.center.y, before.center.z));
    if (
        Math.abs(c.x - before.center.x) > eps * scale ||
        Math.abs(c.y - before.center.y) > eps * scale ||
        Math.abs(c.z - before.center.z) > eps * scale
    ) {
        throw new Error("tiltGlobeCamera: centre changed while tilting");
    }

    // Geometric check: the angle between the local "up" at the centre (globe
    // at the origin) and the centre-to-camera direction is the tilt.
    const actual = viewTilt(cam);
    if (actual !== null && Math.abs(actual - pitch) > 1e-3) {
        throw new Error(
            `tiltGlobeCamera: camera position gives a tilt of ${actual}, expected ${pitch}`,
        );
    }
}

interface Vec3Like {
    x: number;
    y: number;
    z: number;
}

interface LooseGeospatialCamera {
    yaw: number;
    pitch: number;
    radius: number;
    center: Vec3Like;
    position: Vec3Like;
    limits?: Record<string, unknown> | null;
}

function copyVec(v: Vec3Like): Vec3Like {
    return { x: v.x, y: v.y, z: v.z };
}

/**
 * Makes sure the limits allow `pitch` at every radius. Handles the fixed
 * pitch range and the radius-dependent fade that turns pitch off when zoomed
 * far out (Babylon's `pitchDisabledRadiusScale`).
 */
function widenPitchLimits(limits: Record<string, unknown> | null | undefined, pitch: number): void {
    if (!limits) return;

    if (typeof limits.pitchMax === "number" && limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }
    if (typeof limits.pitchMin === "number" && limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }

    const fade = limits.pitchDisabledRadiusScale as Partial<Vec3Like> | null | undefined;
    if (fade && typeof fade === "object") {
        // Push the "pitch disabled" radius range out to infinity.
        if (typeof fade.x === "number") fade.x = Infinity;
        if (typeof fade.y === "number") fade.y = Infinity;
    }
}

function viewTilt(cam: LooseGeospatialCamera): number | null {
    const c = cam.center;
    const p = cam.position;
    if (!c || !p) return null;
    const cLen = Math.hypot(c.x, c.y, c.z);
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const dz = p.z - c.z;
    const dLen = Math.hypot(dx, dy, dz);
    if (cLen === 0 || dLen === 0) return null;
    const cos = (c.x * dx + c.y * dy + c.z * dz) / (cLen * dLen);
    return Math.acos(Math.min(1, Math.max(-1, cos)));
}
