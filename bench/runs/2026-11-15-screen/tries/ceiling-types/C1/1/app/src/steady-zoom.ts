import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

type ListenerOptions = boolean | AddEventListenerOptions | undefined;

type AddListener = (
    this: unknown,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: ListenerOptions,
) => void;

interface Registered {
    readonly listener: EventListener;
    readonly options: ListenerOptions;
}

/**
 * Gives `camera` the library's usual controls on `canvas`: drag to orbit, right-drag to pan,
 * wheel and pinch to zoom, all with the library's inertia. The one change is that every wheel
 * notch moves the camera the same distance toward or away from its target, at any radius. That
 * distance is what a notch gives with the default controls on the camera as it is at this call.
 *
 * The default wheel handler adds each notch to `camera.inertialRadiusOffset`, and the library's
 * per-frame inertia loop takes that offset off the radius, so equal offsets mean equal travel.
 * Rather than copying the library's wheel formula, this runs the library's own wheel handler for
 * every notch against the radius and wheel precision the camera had at this call. It then hands
 * the resulting offset to the camera as it actually is. Everything else is the library's, untouched.
 *
 * @returns A function that removes the controls: every canvas listener and the library's
 *   per-frame inertia hook. Calling it more than once is harmless.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const startRadius = camera.radius;
    const startPrecision = camera.wheelPrecision;

    /** Runs one of the library's wheel listeners as if the camera were still at its starting radius. */
    const zoomAsAtStart = (listener: EventListenerOrEventListenerObject, event: Event): void => {
        const radius = camera.radius;
        const precision = camera.wheelPrecision;
        const pending = camera.inertialRadiusOffset;
        let offset = 0; // what this notch adds to the inertial radius offset
        let jump = 0; // any change the handler makes to the radius directly
        try {
            camera.wheelPrecision = startPrecision;
            if (radius !== startRadius) camera.radius = startRadius;
            const from = camera.radius;
            camera.inertialRadiusOffset = 0;
            if (typeof listener === "function") listener.call(canvas, event);
            else listener.handleEvent(event);
            offset = camera.inertialRadiusOffset;
            jump = camera.radius - from;
        } finally {
            camera.wheelPrecision = precision;
            if (camera.radius !== radius + jump) camera.radius = radius + jump;
            camera.inertialRadiusOffset = pending + offset;
        }
    };

    const wheel: Registered[] = [];
    const detachDefaults = attachWithWheelWrapped(canvas, wheel, zoomAsAtStart, () => attachControl(camera, canvas, scene));

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        for (const { listener, options } of wheel) canvas.removeEventListener("wheel", listener, options);
        wheel.length = 0;
        detachDefaults();
    };
}

/**
 * Calls `attach` while `canvas.addEventListener` registers a wrapper in place of each "wheel"
 * listener it is given. The wrapper passes the event, together with the original listener, to
 * `handle`. Other listeners go through unchanged. The wrappers are recorded in `wheel` so the
 * caller can remove them later, and `addEventListener` is put back before this returns.
 */
function attachWithWheelWrapped(
    canvas: HTMLCanvasElement,
    wheel: Registered[],
    handle: (listener: EventListenerOrEventListenerObject, event: Event) => void,
    attach: () => () => void,
): () => void {
    const target = canvas as unknown as { addEventListener: AddListener };
    const own = Object.getOwnPropertyDescriptor(canvas, "addEventListener");
    const add = target.addEventListener;
    target.addEventListener = function (type, listener, options) {
        if (type !== "wheel" || listener === null) {
            add.call(this, type, listener, options);
            return;
        }
        const original: EventListenerOrEventListenerObject = listener;
        const wrapper: EventListener = (event) => handle(original, event);
        wheel.push({ listener: wrapper, options });
        add.call(this, type, wrapper, options);
    };
    try {
        return attach();
    } catch (error) {
        for (const { listener, options } of wheel) canvas.removeEventListener("wheel", listener, options);
        wheel.length = 0;
        throw error;
    } finally {
        if (own) Object.defineProperty(canvas, "addEventListener", own);
        else Reflect.deleteProperty(canvas, "addEventListener");
    }
}
