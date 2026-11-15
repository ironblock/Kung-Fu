import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** A drag turns the camera this many times as far as the library default for the same pointer movement. */
const DRAG_SPEED = 2;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`, with orbit drags
 * turning the camera {@link DRAG_SPEED} times as far. Left-right and up-down are both covered, and so is
 * the glide after release.
 *
 * Wheel zoom, pinch zoom and panning are unchanged from the library's defaults.
 *
 * How it works: the library accumulates a drag into `inertialAlphaOffset` / `inertialBetaOffset` and then,
 * once per frame, adds the offset to alpha / beta and decays it. Scaling the offsets (for example by
 * halving `angularSensibility`) would not give an exact 2x glide, because the library drops an offset once
 * it falls below a fixed absolute threshold. So the offsets are left alone, and the per-frame step that
 * moves the camera is doubled instead. The controls get a view of the camera that does this; the camera
 * itself is not modified.
 *
 * @returns Removes the canvas listeners and the per-frame inertia hook. Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // The library writes beta as `beta += inertialBetaOffset` (reading the offset just before), then clamps
    // beta to the pole margin. This is the offset value from the most recent read, used to tell that first
    // write apart from the clamp write.
    let lastBetaOffsetRead = 0;

    const view = new Proxy(camera, {
        get(target, key) {
            if (key === "inertialBetaOffset") {
                lastBetaOffsetRead = target.inertialBetaOffset;
            }
            return Reflect.get(target, key, target);
        },
        set(target, key, value) {
            if (key === "alpha") {
                // The inertia step is the only writer of alpha on this view, so every write is a per-frame move.
                const from = target.alpha;
                return Reflect.set(target, key, from + DRAG_SPEED * (value - from), target);
            }
            if (key === "beta" && value === target.beta + lastBetaOffsetRead) {
                // The per-frame move `beta += offset`. Anything else (the pole clamp) is written as given.
                return Reflect.set(target, key, target.beta + DRAG_SPEED * lastBetaOffsetRead, target);
            }
            return Reflect.set(target, key, value, target);
        },
    });
    return attachControl(view, canvas, scene);
}
