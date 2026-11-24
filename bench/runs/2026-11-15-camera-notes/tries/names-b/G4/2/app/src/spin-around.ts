import { flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

// One full turn, split into quarter-turns. Each fly moves the heading by
// +π/2 only, so the step is unambiguous whether the library interpolates raw
// yaw or the shortest angular path, and always goes toward increasing yaw.
const SEGMENTS = 4;
const TURN = Math.PI * 2;

const linear = (g: number) => g;
const easeIn = (g: number) => g * g;
const easeOut = (g: number) => 1 - (1 - g) * (1 - g);

export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const segmentMs = durationMs / SEGMENTS;

    for (let i = 1; i <= SEGMENTS; i++) {
        // Ease in on the first quarter and out on the last; the middle quarters
        // stay linear so the turn does not stop at each segment boundary.
        const ease = i === 1 ? easeIn : i === SEGMENTS ? easeOut : linear;
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: startYaw + (TURN * i) / SEGMENTS,
            pitch: camera.pitch,
            radius: camera.radius,
            center: { ...camera.center },
            durationMs: segmentMs,
            ease,
        });
    }

    // Restore the exact original heading (equivalent to startYaw + 2π).
    setGeospatialOrientation(camera, {
        yaw: startYaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center: { ...camera.center },
    });
}
