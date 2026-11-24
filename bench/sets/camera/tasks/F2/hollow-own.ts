import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }

// Our own WASD + mouse-look controls, written the way the library's are, so a jump can reset the heading.
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera({ ...eye }, { ...target });
    scene.camera = camera;
    let yaw = 0, pitch = 0;
    const head = (e: Vec, t: Vec) => {
        const dx = t.x - e.x, dy = t.y - e.y, dz = t.z - e.z;
        yaw = Math.atan2(dx, dz); pitch = Math.atan2(dy, Math.hypot(dx, dz));
    };
    head(eye, target);
    let mx = 0, mz = 0, ry = 0, rx = 0, drag = false, lx = 0, ly = 0;
    const keys = new Set<string>();
    const STEP = (2 * 16) / Math.sqrt(100000); // one 60 fps frame
    const kd = (e: KeyboardEvent) => keys.add(e.code);
    const ku = (e: KeyboardEvent) => keys.delete(e.code);
    const pd = (e: PointerEvent) => { drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const pm = (e: PointerEvent) => { if (!drag) return; ry += (e.clientX - lx) / 2000; rx += (e.clientY - ly) / 2000; lx = e.clientX; ly = e.clientY; };
    const pu = (e: PointerEvent) => { drag = false; canvas.releasePointerCapture(e.pointerId); };
    const frame = () => {
        if (keys.has("KeyW")) mz += STEP;
        if (keys.has("KeyS")) mz -= STEP;
        if (keys.has("KeyA")) mx -= STEP;
        if (keys.has("KeyD")) mx += STEP;
        const rot = rx !== 0 || ry !== 0, mov = mx !== 0 || mz !== 0;
        if (rot) { yaw += ry; pitch = Math.max(-(Math.PI / 2 - 0.01), Math.min(Math.PI / 2 - 0.01, pitch - rx)); }
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        if (mov) {
            camera.position.x += sy * cp * mz + cy * mx;
            camera.position.y += sp * mz;
            camera.position.z += cy * cp * mz - sy * mx;
        }
        if (rot || mov) camera.target.set(camera.position.x + sy * cp, camera.position.y + sp, camera.position.z + cy * cp);
        mx *= 0.9; mz *= 0.9; rx *= 0.9; ry *= 0.9;
        const eps = 0.002;
        if (Math.abs(mx) < eps) mx = 0; if (Math.abs(mz) < eps) mz = 0;
        if (Math.abs(rx) < eps) rx = 0; if (Math.abs(ry) < eps) ry = 0;
    };
    scene._beforeRender.push(frame);
    const ev: [string, (e: any) => void][] = [["keydown", kd], ["keyup", ku], ["pointerdown", pd], ["pointermove", pm], ["pointerup", pu]];
    for (const [n, h] of ev) canvas.addEventListener(n, h);
    return {
        camera,
        jumpTo(e: Vec, t: Vec): void {
            camera.position.set(e.x, e.y, e.z); camera.target.set(t.x, t.y, t.z); head(e, t);
            mx = mz = rx = ry = 0;
        },
        dispose(): void {
            const i = scene._beforeRender.indexOf(frame); if (i >= 0) scene._beforeRender.splice(i, 1);
            for (const [n, h] of ev) canvas.removeEventListener(n, h);
        },
    };
}
