// What the hidden checks share. A subject never sees this file.
//
// A check drives the subject's code the way the library's own unit tests drive the library: with a
// canvas that is a plain object and remembers its listeners, and with a real scene made on the
// library's null engine, which needs no GPU and no browser.
import { createNullEngine, createSceneContext } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

type Handler = (event: unknown) => void;

export interface FakeCanvas {
    listeners: Map<string, Handler[]>;
    attributes: Map<string, string>;
    captured: number[];
    released: number[];
    tabIndex: number;
    width: number;
    height: number;
    clientWidth: number;
    clientHeight: number;
    style: Record<string, string>;
    addEventListener(type: string, handler: Handler, options?: unknown): void;
    removeEventListener(type: string, handler: Handler, options?: unknown): void;
    hasAttribute(name: string): boolean;
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    setPointerCapture(id: number): void;
    releasePointerCapture(id: number): void;
    hasPointerCapture(id: number): boolean;
    getBoundingClientRect(): { left: number; top: number; right: number; bottom: number; x: number; y: number; width: number; height: number };
    focus(): void;
    blur(): void;
}

/** A canvas of the given size, in CSS pixels and in device pixels alike, at the page's top left. */
export function makeCanvas(width = 800, height = 600): FakeCanvas {
    const listeners = new Map<string, Handler[]>();
    const attributes = new Map<string, string>();
    const captured: number[] = [];
    const released: number[] = [];
    return {
        listeners,
        attributes,
        captured,
        released,
        tabIndex: -1,
        width,
        height,
        clientWidth: width,
        clientHeight: height,
        style: {},
        addEventListener(type, handler): void {
            const list = listeners.get(type) ?? [];
            list.push(handler);
            listeners.set(type, list);
        },
        removeEventListener(type, handler): void {
            const list = listeners.get(type);
            const at = list ? list.indexOf(handler) : -1;
            if (list && at >= 0) {
                list.splice(at, 1);
            }
        },
        hasAttribute: (name) => attributes.has(name),
        getAttribute: (name) => attributes.get(name) ?? null,
        setAttribute(name, value): void {
            attributes.set(name, String(value));
        },
        removeAttribute(name): void {
            attributes.delete(name);
        },
        setPointerCapture(id): void {
            captured.push(id);
        },
        releasePointerCapture(id): void {
            released.push(id);
        },
        hasPointerCapture: (id) => captured.includes(id) && !released.includes(id),
        getBoundingClientRect: () => ({ left: 0, top: 0, right: width, bottom: height, x: 0, y: 0, width, height }),
        focus(): void {},
        blur(): void {},
    };
}

/** Hand the canvas to code that wants an HTMLCanvasElement. */
export function asCanvas(canvas: FakeCanvas): HTMLCanvasElement {
    return canvas as unknown as HTMLCanvasElement;
}

/** How many listeners the canvas holds, over every kind of event. */
export function listenerCount(canvas: FakeCanvas): number {
    let count = 0;
    for (const list of canvas.listeners.values()) {
        count += list.length;
    }
    return count;
}

/** Send one event to every listener of that kind. The event is a plain object with the given fields. */
export function fire(canvas: FakeCanvas, type: string, fields: Record<string, unknown> = {}): void {
    const event = { type, preventDefault(): void {}, stopPropagation(): void {}, ...fields };
    for (const handler of [...(canvas.listeners.get(type) ?? [])]) {
        handler(event);
    }
}

/** The fields of a pointer event: the primary mouse button at (0, 0), unless given otherwise. */
export function pointer(fields: Record<string, unknown> = {}): Record<string, unknown> {
    return { button: 0, buttons: 1, clientX: 0, clientY: 0, offsetX: 0, offsetY: 0, movementX: 0, movementY: 0, pointerId: 1, pointerType: "mouse", ...fields };
}

/** The fields of a touch event whose changed touches are the given [identifier, x, y] triples. */
export function touches(...points: [number, number, number][]): Record<string, unknown> {
    return { changedTouches: points.map(([identifier, clientX, clientY]) => ({ identifier, clientX, clientY })) };
}

/** The fields of a keyboard event for the given `code`, with no modifier held unless given. */
export function key(code: string, fields: Record<string, unknown> = {}): Record<string, unknown> {
    return { code, key: code, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, ...fields };
}

/** A real scene on the library's null engine. */
export function makeScene(): SceneContext {
    return createSceneContext(createNullEngine(), { defaultRenderTask: false });
}

/** Run the scene's per-frame callbacks, as one frame of the render loop does, `frames` times. */
export function tick(scene: SceneContext, frames = 1, deltaMs = 16): void {
    for (let i = 0; i < frames; i++) {
        for (const callback of [...scene._beforeRender]) {
            callback(deltaMs);
        }
    }
}
