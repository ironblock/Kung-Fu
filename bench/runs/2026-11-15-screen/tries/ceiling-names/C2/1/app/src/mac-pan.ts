import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives `camera` the library's default mouse and touch controls on `canvas` (primary drag orbits, right drag pans,
 * wheel and pinch zoom), and also makes a primary-button drag that starts with Ctrl held pan instead of orbit, for
 * Mac laptops with no right button. Returns a function that removes all of it.
 *
 * `attachControl` has no option for a modifier key, so the Ctrl drag is handed to the library's own pan code: while
 * `attachControl` runs, the pointer listeners it adds to the canvas are wrapped, and the wrappers present a drag that
 * began with Ctrl + primary button as a right-button drag. It therefore pans, and glides, exactly as far as a right
 * drag would. All other events reach the library unchanged, and there is only one `attachControl`, so wheel, pinch
 * and the per-frame inertia are the library's own and happen once.
 *
 * Ctrl is read when the button goes down: pressing or releasing it mid-drag does not switch between orbit and pan.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Pointers whose current drag started with Ctrl + primary button.
    const ctrlPanPointers = new Set<number>();

    // What the library's pointer listener for `type` is given in place of `event`.
    const toLibraryEvent = (type: string, event: Event): Event => {
        const pointer = event as PointerEvent;
        if (type === "pointerdown") {
            if (pointer.button === 0 && pointer.ctrlKey && pointer.pointerType !== "touch") ctrlPanPointers.add(pointer.pointerId);
            else ctrlPanPointers.delete(pointer.pointerId);
        }
        return ctrlPanPointers.has(pointer.pointerId) ? asSecondaryButtonDrag(pointer) : event;
    };

    const wrappers: WrappedListener[] = [];
    const detachLibrary = withWrappedPointerListeners(canvas, wrappers, toLibraryEvent, () => attachControl(camera, canvas, scene));

    // Added after the library's listeners, so the library still sees the release as the end of a right-button drag.
    const endCtrlPan = (event: PointerEvent): void => {
        ctrlPanPointers.delete(event.pointerId);
    };
    // On macOS, Ctrl + click also opens the context menu, which would cut the drag short.
    const blockContextMenu = (event: Event): void => {
        if (ctrlPanPointers.size > 0) event.preventDefault();
    };
    canvas.addEventListener("pointerup", endCtrlPan);
    canvas.addEventListener("pointercancel", endCtrlPan);
    canvas.addEventListener("contextmenu", blockContextMenu);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        try {
            // The library removes its listeners by their original functions; map those to our wrappers.
            withWrappedPointerListeners(canvas, wrappers, toLibraryEvent, detachLibrary);
        } finally {
            for (const { type, wrapper, capture } of wrappers.splice(0)) canvas.removeEventListener(type, wrapper, capture);
            canvas.removeEventListener("pointerup", endCtrlPan);
            canvas.removeEventListener("pointercancel", endCtrlPan);
            canvas.removeEventListener("contextmenu", blockContextMenu);
            ctrlPanPointers.clear();
        }
    };
}

interface WrappedListener {
    type: string;
    listener: EventListenerOrEventListenerObject;
    capture: boolean;
    wrapper: EventListener;
}

/**
 * Runs `run` with the canvas's `addEventListener` / `removeEventListener` temporarily replaced. Pointer listeners
 * added meanwhile are registered through a wrapper that passes them `toLibraryEvent(type, event)`, and removing such
 * a listener meanwhile removes its wrapper. Everything else goes straight through. The canvas's own methods are put
 * back before this returns.
 */
function withWrappedPointerListeners<T>(
    canvas: HTMLCanvasElement,
    wrappers: WrappedListener[],
    toLibraryEvent: (type: string, event: Event) => Event,
    run: () => T,
): T {
    const target: EventTarget = canvas;
    const add = target.addEventListener;
    const remove = target.removeEventListener;
    const ownAdd = Object.getOwnPropertyDescriptor(canvas, "addEventListener");
    const ownRemove = Object.getOwnPropertyDescriptor(canvas, "removeEventListener");
    const indexOf = (type: string, listener: EventListenerOrEventListenerObject, capture: boolean): number =>
        wrappers.findIndex((w) => w.type === type && w.listener === listener && w.capture === capture);

    const wrappingAdd: EventTarget["addEventListener"] = (type, listener, options) => {
        if (!listener || !type.includes("pointer")) return add.call(canvas, type, listener, options);
        const original: EventListenerOrEventListenerObject = listener;
        const capture = isCapture(options);
        if (indexOf(type, original, capture) >= 0) return; // the DOM ignores a duplicate registration too
        const wrapper = function (this: unknown, event: Event): void {
            const view = toLibraryEvent(type, event);
            if (typeof original === "function") original.call(this, view);
            else original.handleEvent(view);
        };
        wrappers.push({ type, listener: original, capture, wrapper });
        add.call(canvas, type, wrapper, options);
    };
    const unwrappingRemove: EventTarget["removeEventListener"] = (type, listener, options) => {
        const index = listener ? indexOf(type, listener, isCapture(options)) : -1;
        if (index < 0) return remove.call(canvas, type, listener, options);
        const [{ wrapper }] = wrappers.splice(index, 1);
        remove.call(canvas, type, wrapper, options);
    };

    Object.defineProperty(canvas, "addEventListener", { value: wrappingAdd, configurable: true, writable: true });
    Object.defineProperty(canvas, "removeEventListener", { value: unwrappingRemove, configurable: true, writable: true });
    try {
        return run();
    } finally {
        restoreOwnProperty(canvas, "addEventListener", ownAdd);
        restoreOwnProperty(canvas, "removeEventListener", ownRemove);
    }
}

function isCapture(options: boolean | EventListenerOptions | undefined): boolean {
    return typeof options === "boolean" ? options : options?.capture === true;
}

function restoreOwnProperty(object: object, key: string, descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) Object.defineProperty(object, key, descriptor);
    else Reflect.deleteProperty(object, key);
}

/**
 * A view of `event` that reads as the secondary (right) button with Ctrl up, i.e. exactly what a right-button drag
 * delivers. Primary and secondary are swapped in `button` and `buttons`; everything else is the real event.
 */
function asSecondaryButtonDrag(event: PointerEvent): PointerEvent {
    return new Proxy(event, {
        get(target, key) {
            if (key === "button") return target.button === 0 ? 2 : target.button === 2 ? 0 : target.button;
            if (key === "buttons") {
                const buttons = target.buttons;
                return typeof buttons === "number" ? (buttons & ~3) | ((buttons & 1) << 1) | ((buttons & 2) >> 1) : buttons;
            }
            if (key === "ctrlKey") return false;
            const value: unknown = Reflect.get(target, key);
            // DOM methods such as preventDefault must be called on the real event, not on the proxy.
            return typeof value === "function" && key !== "constructor" ? value.bind(target) : value;
        },
    });
}
