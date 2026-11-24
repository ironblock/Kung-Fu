import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";

// The turn is split into equal angular steps. Each step is a short fly
// (at most 30 degrees), so the library always takes the forward direction.
// Ease-in/out is applied through the step timing: the time boundaries follow a
// smoothstep curve, and each step runs at a constant speed.
const SEGMENTS = 12;

const linear = (g: number): number => g;

// Inverse of smoothstep(s) = 3s^2 - 2s^3: the time fraction at which the
// eased angle fraction equals `a`.
function smoothstepInverse(a: number): number {
    return 0.5 - Math.sin(Math.asin(1 - 2 * a) / 3);
}

export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const pitch = camera.pitch;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    const stepAngle = (2 * Math.PI) / SEGMENTS;
    let prevTime = 0;

    for (let k = 1; k <= SEGMENTS; k++) {
        const t = smoothstepInverse(k / SEGMENTS);
        const segmentMs = (t - prevTime) * durationMs;
        prevTime = t;

        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: startYaw + k * stepAngle,
            pitch,
            radius,
            center: { ...center },
            durationMs: segmentMs,
            ease: linear,
        });
    }

    // Restore the exact starting heading (one full turn later is the same
    // heading, but this avoids accumulated float drift). Centre, pitch and
    // zoom are set back to their starting values as well.
    setGeospatialOrientation(camera, { yaw: startYaw, pitch, radius, center });
}
