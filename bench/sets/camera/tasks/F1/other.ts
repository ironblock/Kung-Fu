import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Another right answer: the library keeps the mouse; our own code moves the camera from the keys.
// The library is handed a stand-in canvas that passes it only pointer and context-menu events.
const FORWARD = ["KeyW", "ArrowUp"], BACK = ["KeyS", "ArrowDown"], LEFT = ["KeyA", "ArrowLeft"], RIGHT = ["KeyD", "ArrowRight"];
const UP = ["Space", "PageUp"], DOWN = ["ShiftLeft", "ShiftRight", "PageDown"];

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const pass = new Set(["pointerdown", "pointermove", "pointerup", "contextmenu"]);
    const proxy = {
        addEventListener: (t: string, h: EventListener) => pass.has(t) && canvas.addEventListener(t, h),
        removeEventListener: (t: string, h: EventListener) => pass.has(t) && canvas.removeEventListener(t, h),
        setPointerCapture: (id: number) => canvas.setPointerCapture(id),
        releasePointerCapture: (id: number) => canvas.releasePointerCapture(id),
        hasAttribute: () => true,
    } as unknown as HTMLCanvasElement;
    const detachMouse = attachFreeControl(camera, proxy, scene);
    if (!canvas.hasAttribute("tabindex")) canvas.tabIndex = 0;

    const held = new Set<string>();
    const down = (e: Event) => held.add((e as KeyboardEvent).code);
    const up = (e: Event) => held.delete((e as KeyboardEvent).code);
    canvas.addEventListener("keydown", down);
    canvas.addEventListener("keyup", up);
    const any = (codes: string[]) => codes.some((c) => held.has(c));
    let vx = 0, vy = 0, vz = 0;
    const update = (deltaMs: number) => {
        const step = camera.speed * 20 * (Math.max(deltaMs, 1) / Math.sqrt(100000));
        if (any(FORWARD)) vz += step;
        if (any(BACK)) vz -= step;
        if (any(RIGHT)) vx += step;
        if (any(LEFT)) vx -= step;
        if (any(UP)) vy += step;
        if (any(DOWN)) vy -= step;
        if (vx || vy || vz) {
            let fx = camera.target.x - camera.position.x, fy = camera.target.y - camera.position.y, fz = camera.target.z - camera.position.z;
            const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
            const hl = Math.hypot(fx, fz) || 1;
            const rx = fz / hl, rz = -fx / hl;
            const dx = fx * vz + rx * vx, dy = fy * vz + vy, dz = fz * vz + rz * vx;
            camera.position.set(camera.position.x + dx, camera.position.y + dy, camera.position.z + dz);
            camera.target.set(camera.target.x + dx, camera.target.y + dy, camera.target.z + dz);
        }
        const k = camera.inertia, eps = camera.speed * 20 * 0.001;
        vx *= k; vy *= k; vz *= k;
        if (Math.abs(vx) < eps) vx = 0;
        if (Math.abs(vy) < eps) vy = 0;
        if (Math.abs(vz) < eps) vz = 0;
    };
    scene._beforeRender.push(update);
    return () => {
        detachMouse();
        canvas.removeEventListener("keydown", down);
        canvas.removeEventListener("keyup", up);
        const i = scene._beforeRender.indexOf(update);
        if (i >= 0) scene._beforeRender.splice(i, 1);
    };
}
