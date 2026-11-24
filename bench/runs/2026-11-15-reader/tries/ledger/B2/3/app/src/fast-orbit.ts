import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much farther a drag turns the camera than the library's default controls. */
const ORBIT_GAIN = 2;

/** The library's inertia clamps beta to this band after every write (see arc-rotate-controls). */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse and touch controls, with orbit
 * turns (drag and glide) scaled by {@link ORBIT_GAIN}.
 *
 * The library applies orbit input in its per-frame inertia step as
 * `alpha += offset` and `beta += offset`, and decays the offset with an epsilon
 * cutoff. Scaling the input (for example by halving `angularSensibility`) would
 * move the cutoff and so would not give exactly twice the glide. Instead the
 * library runs unchanged on a proxy of the camera whose alpha and beta writes
 * double the change they request. Every frame's applied turn is then exactly
 * twice the library's own, glide included. Wheel zoom, pinch zoom and panning
 * write other fields and are untouched.
 *
 * The returned function removes the canvas listeners and the per-frame hook.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const scaled = new Proxy(camera, {
        set(target, key, value) {
            if (key === "alpha" && typeof value === "number") {
                const old = target.alpha;
                target.alpha = old + ORBIT_GAIN * (value - old);
                return true;
            }
            if (key === "beta" && typeof value === "number") {
                // The library writes beta twice per frame: once after adding the offset, and
                // once more to clamp it. The second write sees the already-scaled value, so
                // its delta is zero and nothing is counted twice. The result is clamped here
                // so the doubled step can never pass the pole limits.
                const old = target.beta;
                const next = old + ORBIT_GAIN * (value - old);
                target.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, next));
                return true;
            }
            return Reflect.set(target, key, value);
        },
    });

    return attachControl(scaled, canvas, scene);
}
