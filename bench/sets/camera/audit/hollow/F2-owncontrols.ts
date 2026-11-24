import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }

// Hollow: not the library's controls. Our own fly and look, which read the view from position and
// target each frame, so a jump needs nothing more. Speed, inertia and turn rate are our own, not the library's.
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera(eye, target);
    scene.camera = camera;
    const keys = new Set<string>();
    let dragging = false, lx = 0, ly = 0, turnX = 0, turnY = 0;
    const kd = (e: Event) => keys.add((e as KeyboardEvent).code);
    const ku = (e: Event) => keys.delete((e as KeyboardEvent).code);
    const pd = (e: Event) => { const p = e as PointerEvent; dragging = true; lx = p.clientX; ly = p.clientY; };
    const pm = (e: Event) => { const p = e as PointerEvent; if (!dragging) return; turnY += (p.clientX - lx) / 500; turnX += (p.clientY - ly) / 500; lx = p.clientX; ly = p.clientY; };
    const pu = () => { dragging = false; };
    canvas.addEventListener("keydown", kd);
    canvas.addEventListener("keyup", ku);
    canvas.addEventListener("pointerdown", pd);
    canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu);
    const update = () => {
        const dx = camera.target.x - camera.position.x, dy = camera.target.y - camera.position.y, dz = camera.target.z - camera.position.z;
        let yaw = Math.atan2(dx, dz), pitch = Math.atan2(dy, Math.hypot(dx, dz));
        yaw += turnY; pitch -= turnX; turnX = 0; turnY = 0;
        const f = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
        const step = keys.has("KeyW") ? 1 : keys.has("KeyS") ? -1 : 0;
        camera.position.set(camera.position.x + f.x * step, camera.position.y + f.y * step, camera.position.z + f.z * step);
        camera.target.set(camera.position.x + f.x, camera.position.y + f.y, camera.position.z + f.z);
    };
    scene._beforeRender.push(update);
    return {
        camera,
        jumpTo(e: Vec, t: Vec) {
            camera.position.set(e.x, e.y, e.z);
            camera.target.set(t.x, t.y, t.z);
        },
        dispose() {
            canvas.removeEventListener("keydown", kd);
            canvas.removeEventListener("keyup", ku);
            canvas.removeEventListener("pointerdown", pd);
            canvas.removeEventListener("pointermove", pm);
            canvas.removeEventListener("pointerup", pu);
            const i = scene._beforeRender.indexOf(update);
            if (i >= 0) scene._beforeRender.splice(i, 1);
        },
    };
}
