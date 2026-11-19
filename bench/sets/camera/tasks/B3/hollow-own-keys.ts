import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly controls written out: drag to look, keys to move with inertia; Shift only scales the speed.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const held = new Set<string>();
    let dragging = false, lx = 0, ly = 0, rx = 0, ry = 0, vx = 0, vy = 0, vz = 0;
    const onDown = (e: Event): void => {
        const p = e as PointerEvent;
        dragging = true; lx = p.clientX; ly = p.clientY;
        canvas.setPointerCapture(p.pointerId);
    };
    const onMove = (e: Event): void => {
        if (!dragging) return;
        const p = e as PointerEvent;
        ry += (p.clientX - lx) / camera.angularSensitivity;
        rx += (p.clientY - ly) / camera.angularSensitivity;
        lx = p.clientX; ly = p.clientY;
    };
    const onUp = (e: Event): void => { dragging = false; canvas.releasePointerCapture((e as PointerEvent).pointerId); };
    const kd = (e: Event): void => void held.add((e as KeyboardEvent).code);
    const ku = (e: Event): void => void held.delete((e as KeyboardEvent).code);
    const step = (deltaMs: number): void => {
        const dt = Math.max(deltaMs, 1);
        const s = camera.speed * (held.has("ShiftLeft") || held.has("ShiftRight") ? 3 : 1) * Math.sqrt((dt * dt) / 100000);
        const has = (...c: string[]) => c.some((k) => held.has(k));
        if (has("KeyW", "ArrowUp")) vz += s;
        if (has("KeyS", "ArrowDown")) vz -= s;
        if (has("KeyD", "ArrowRight")) vx += s;
        if (has("KeyA", "ArrowLeft")) vx -= s;
        if (has("Space", "PageUp")) vy += s;
        if (has("PageDown")) vy -= s;
        if (rx || ry) {
            camera._yaw += ry;
            camera._pitch = Math.max(-(Math.PI / 2 - 0.01), Math.min(Math.PI / 2 - 0.01, camera._pitch - rx));
        }
        const yaw = camera._yaw, pitch = camera._pitch;
        const f = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
        if (vx || vy || vz) {
            // right = forward x up
            const r = { x: -f.z, z: f.x };
            const rl = Math.hypot(r.x, r.z) || 1;
            camera.position.x += f.x * vz + (r.x / rl) * vx;
            camera.position.y += f.y * vz + vy;
            camera.position.z += f.z * vz + (r.z / rl) * vx;
        }
        if (vx || vy || vz || rx || ry) camera.target.set(camera.position.x + f.x, camera.position.y + f.y, camera.position.z + f.z);
        const k = camera.inertia, eps = camera.speed * 0.001;
        vx *= k; vy *= k; vz *= k; rx *= k; ry *= k;
        if (Math.abs(vx) < eps) vx = 0;
        if (Math.abs(vy) < eps) vy = 0;
        if (Math.abs(vz) < eps) vz = 0;
        if (Math.abs(rx) < eps) rx = 0;
        if (Math.abs(ry) < eps) ry = 0;
    };
    const pairs: [string, (e: Event) => void][] = [["pointerdown", onDown], ["pointermove", onMove], ["pointerup", onUp], ["keydown", kd], ["keyup", ku]];
    for (const [t, f] of pairs) canvas.addEventListener(t, f);
    scene._beforeRender.push(step);
    return () => {
        for (const [t, f] of pairs) canvas.removeEventListener(t, f);
        const i = scene._beforeRender.indexOf(step);
        if (i >= 0) scene._beforeRender.splice(i, 1);
    };
}
