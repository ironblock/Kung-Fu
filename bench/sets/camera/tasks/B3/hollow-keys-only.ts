import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Hollow try B3-h1: hand-written keyboard fly controls that keep the view consistent, with Shift as a pure
// speed key, but no mouse look at all: a drag never turns the view.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent): void => void keys.add(e.code);
    const onKeyUp = (e: KeyboardEvent): void => void keys.delete(e.code);
    const has = (...c: string[]): boolean => c.some((k) => keys.has(k));
    let vx = 0, vy = 0, vz = 0;
    const update = (deltaMs: number): void => {
        const dt = Math.max(deltaMs, 1);
        const s = camera.speed * (has("ShiftLeft", "ShiftRight") ? 3 : 1) * Math.sqrt((dt * dt) / 100000);
        vz += s * ((has("KeyW", "ArrowUp") ? 1 : 0) - (has("KeyS", "ArrowDown") ? 1 : 0));
        vx += s * ((has("KeyD", "ArrowRight") ? 1 : 0) - (has("KeyA", "ArrowLeft") ? 1 : 0));
        vy += s * ((has("Space", "PageUp") ? 1 : 0) - (has("PageDown") ? 1 : 0));
        if (vx || vy || vz) {
            const cy = Math.cos(camera._yaw), sy = Math.sin(camera._yaw), cp = Math.cos(camera._pitch), sp = Math.sin(camera._pitch);
            camera.position.x += sy * cp * vz + cy * vx;
            camera.position.y += sp * vz + vy;
            camera.position.z += cy * cp * vz - sy * vx;
            camera.target.set(camera.position.x + sy * cp, camera.position.y + sp, camera.position.z + cy * cp);
        }
        const eps = camera.speed * 0.001;
        vx = Math.abs((vx *= camera.inertia)) < eps ? 0 : vx;
        vy = Math.abs((vy *= camera.inertia)) < eps ? 0 : vy;
        vz = Math.abs((vz *= camera.inertia)) < eps ? 0 : vz;
    };
    canvas.addEventListener("keydown", onKeyDown as EventListener);
    canvas.addEventListener("keyup", onKeyUp as EventListener);
    scene._beforeRender.push(update);
    return () => {
        canvas.removeEventListener("keydown", onKeyDown as EventListener);
        canvas.removeEventListener("keyup", onKeyUp as EventListener);
        const i = scene._beforeRender.indexOf(update);
        if (i >= 0) scene._beforeRender.splice(i, 1);
    };
}
