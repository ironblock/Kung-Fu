import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Hollow try B3-h3: hand-written fly controls built on the camera's _yaw and _pitch fields. Mouse look turns
// _yaw/_pitch and moves follow them, but camera.target is never moved, so the view the library builds from
// position and target never turns, and it swings round to keep facing the old target as the camera moves.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const keys = new Set<string>();
    let dragging = false, lastX = 0, lastY = 0;
    const onKeyDown = (e: KeyboardEvent): void => void keys.add(e.code);
    const onKeyUp = (e: KeyboardEvent): void => void keys.delete(e.code);
    const onDown = (e: PointerEvent): void => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onMove = (e: PointerEvent): void => {
        if (!dragging) return;
        camera._yaw += (e.clientX - lastX) / camera.angularSensitivity;
        camera._pitch = Math.max(-1.5, Math.min(1.5, camera._pitch - (e.clientY - lastY) / camera.angularSensitivity));
        lastX = e.clientX; lastY = e.clientY;
    };
    const onUp = (): void => { dragging = false; };
    const has = (...c: string[]): boolean => c.some((k) => keys.has(k));
    const update = (deltaMs: number): void => {
        const s = camera.speed * (has("ShiftLeft", "ShiftRight") ? 3 : 1) * (deltaMs / 1000);
        const f = (has("KeyW", "ArrowUp") ? 1 : 0) - (has("KeyS", "ArrowDown") ? 1 : 0);
        const r = (has("KeyD", "ArrowRight") ? 1 : 0) - (has("KeyA", "ArrowLeft") ? 1 : 0);
        const u = (has("Space") ? 1 : 0) - (has("PageDown") ? 1 : 0);
        const cy = Math.cos(camera._yaw), sy = Math.sin(camera._yaw), cp = Math.cos(camera._pitch), sp = Math.sin(camera._pitch);
        if (f || r || u) {
            camera.position.x += s * (sy * cp * f + cy * r);
            camera.position.y += s * (sp * f + u);
            camera.position.z += s * (cy * cp * f - sy * r);
        }
    };
    const pairs: [string, (e: any) => void][] = [["keydown", onKeyDown], ["keyup", onKeyUp], ["pointerdown", onDown], ["pointermove", onMove], ["pointerup", onUp]];
    for (const [t, h] of pairs) canvas.addEventListener(t, h);
    scene._beforeRender.push(update);
    return () => {
        for (const [t, h] of pairs) canvas.removeEventListener(t, h);
        const i = scene._beforeRender.indexOf(update);
        if (i >= 0) scene._beforeRender.splice(i, 1);
    };
}
