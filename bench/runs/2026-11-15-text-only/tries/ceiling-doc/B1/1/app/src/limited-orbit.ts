import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel / pinch to zoom)
 * and keep `camera.radius` within [minDistance, maxDistance] at all times.
 *
 * Why this is not just a clamp in a per-frame callback:
 *  - Wheel zoom goes through `inertialRadiusOffset`, which the library's own
 *    `applyInertia` (on `scene._beforeRender`) subtracts from `radius` every frame.
 *  - Two-finger pinch writes `radius` directly inside the `touchmove` handler.
 * So `radius` is written from two places, at two different times.
 *
 * Primary strategy: `radius` is an own accessor property on the camera
 * (`Object.defineProperty` in `createArcRotateCamera`). If it is configurable we wrap
 * its setter so every write is clamped as it happens: no per-frame work of ours at all.
 *
 * Fallback (if the property cannot be redefined): a callback on the same
 * `scene._beforeRender` chain the library uses, plus wheel/touch listeners registered
 * after the library's. The callback clamps `radius` and also limits
 * `inertialRadiusOffset` so the library's next `radius -= offset` cannot leave the
 * range, which makes it correct whether it runs before or after `applyInertia`.
 *
 * Returns a cleanup function that removes the library's controls, our listeners,
 * our per-frame callback (if any), and restores the original `radius` property.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance (got ${minDistance}, ${maxDistance})`);
    }

    const clamp = (r: number): number => (Number.isNaN(r) ? minDistance : Math.min(maxDistance, Math.max(minDistance, r)));

    /** Clamp radius now and stop any zoom inertia that pushes outwards. */
    const clampRadiusNow = (): void => {
        const r = camera.radius;
        const c = clamp(r);
        if (c !== r) camera.radius = c;
        // radius -= offset: a negative offset grows the radius, a positive one shrinks it.
        if (c >= maxDistance && camera.inertialRadiusOffset < 0) camera.inertialRadiusOffset = 0;
        if (c <= minDistance && camera.inertialRadiusOffset > 0) camera.inertialRadiusOffset = 0;
    };

    // Bring the camera inside the range immediately.
    clampRadiusNow();

    const detachControls = attachControl(camera, canvas, scene);

    // ---- Primary: clamp every write to camera.radius --------------------------------
    const originalRadius = Object.getOwnPropertyDescriptor(camera, "radius");
    let accessorInstalled = false;
    if (originalRadius && originalRadius.configurable && originalRadius.get && originalRadius.set) {
        const get = originalRadius.get;
        const set = originalRadius.set;
        Object.defineProperty(camera, "radius", {
            configurable: true,
            enumerable: originalRadius.enumerable,
            get() {
                return get.call(this);
            },
            set(this: ArcRotateCamera, value: number) {
                const current = get.call(this) as number;
                let v = Number.isNaN(value) ? current : value;
                if (v > maxDistance) {
                    v = maxDistance;
                    if (this.inertialRadiusOffset < 0) this.inertialRadiusOffset = 0;
                } else if (v < minDistance) {
                    v = minDistance;
                    if (this.inertialRadiusOffset > 0) this.inertialRadiusOffset = 0;
                }
                set.call(this, v);
            },
        });
        accessorInstalled = true;
    }

    if (accessorInstalled) {
        return () => {
            detachControls();
            if (originalRadius) Object.defineProperty(camera, "radius", originalRadius);
        };
    }

    // ---- Fallback: per-frame clamp + event-time clamp -------------------------------
    type FrameHook = (...args: unknown[]) => void;
    const hooks = (scene as unknown as { _beforeRender?: unknown })._beforeRender;
    let removeHook: (() => void) | null = null;

    /** Clamp radius and limit the pending inertial zoom so the next step stays in range. */
    const enforceForNextStep = (): void => {
        clampRadiusNow();
        const r = camera.radius;
        const off = camera.inertialRadiusOffset;
        if (r - off > maxDistance) camera.inertialRadiusOffset = r - maxDistance;
        else if (r - off < minDistance) camera.inertialRadiusOffset = r - minDistance;
    };

    /** Without a frame hook: limit the offset by its whole geometric decay, sum = off / (1 - inertia). */
    const enforceWholeDecay = (): void => {
        clampRadiusNow();
        const r = camera.radius;
        const k = camera.inertia < 1 ? 1 - camera.inertia : 0;
        const off = camera.inertialRadiusOffset;
        if (k === 0) {
            camera.inertialRadiusOffset = 0; // no decay: cannot bound it safely, drop it
        } else if (r - off / k > maxDistance) {
            camera.inertialRadiusOffset = (r - maxDistance) * k;
        } else if (r - off / k < minDistance) {
            camera.inertialRadiusOffset = (r - minDistance) * k;
        }
    };

    const frameHook: FrameHook = () => enforceForNextStep();
    if (Array.isArray(hooks)) {
        hooks.push(frameHook);
        removeHook = () => {
            const i = hooks.indexOf(frameHook);
            if (i >= 0) hooks.splice(i, 1);
        };
    } else if (hooks instanceof Set) {
        hooks.add(frameHook);
        removeHook = () => hooks.delete(frameHook);
    } else {
        console.warn("attachLimitedOrbit: could not hook the render loop; zoom limits are enforced on input events only.");
    }

    const onInput = removeHook ? enforceForNextStep : enforceWholeDecay;
    // Registered after attachControl's listeners, so on the same canvas these run after the
    // library's wheel / pinch handlers for the same event.
    const events = ["wheel", "touchmove", "touchend", "pointermove"] as const;
    for (const type of events) canvas.addEventListener(type, onInput, { passive: true });

    return () => {
        detachControls();
        for (const type of events) canvas.removeEventListener(type, onInput);
        removeHook?.();
    };
}
