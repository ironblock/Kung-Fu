import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Orbits `camera` around its target by `turns` full turns, always towards
 * increasing `alpha`, using the library's camera-transition easing.
 * `beta`, `radius` and `target` are left alone. Resolves once the camera has
 * arrived, with `camera.alpha === startAlpha + 2π · turns`.
 */
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
    }
    const startAlpha = camera.alpha;
    const sweep = 2 * Math.PI * turns;
    const endAlpha = startAlpha + sweep;
    if (sweep === 0) {
        return;
    }

    // Momentum left over from a drag just before "Tour" was pressed would
    // otherwise keep changing the angle, height, distance or target.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Asking interpolateArcRotateCamera for { alpha: endAlpha } is not safe:
    // its declarations don't say how it treats angles, and orbit-camera
    // transitions usually take the short way round. Then a goal of
    // start + 2π·turns would mean no motion at all for 1 or 2 turns, and a
    // quarter turn backwards for 0.75. So we let the library ease a plain
    // number that has no wrap-around: the radius of a private stand-in camera
    // that is never rendered, from r0 to r0 + sweep. Its path is the
    // library's easing curve over a distance equal to our sweep. Every frame
    // we copy how far it has got onto the real camera's alpha.
    const r0 = 1;
    const driver = createArcRotateCamera(0, Math.PI / 2, r0, camera.target);

    let travelled = 0;
    let frame = 0;
    const follow = (): void => {
        // Clamped and never decreasing, so alpha only ever grows and never overshoots.
        travelled = Math.min(Math.max(driver.radius - r0, travelled), sweep);
        camera.alpha = startAlpha + travelled;
        frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);

    try {
        await interpolateArcRotateCamera(driver, scene, { radius: r0 + sweep });
    } finally {
        cancelAnimationFrame(frame);
    }

    // At this point the camera is at most a frame's worth (at the very end of
    // the ease) from the goal, so landing exactly on it is not a visible jump.
    camera.alpha = endAlpha;
}
