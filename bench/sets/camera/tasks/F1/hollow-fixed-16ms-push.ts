import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// The library's controls, plus our own push of 19 times theirs on the same keys, with the same glide.
const FWD = ["KeyW", "ArrowUp"], BACK = ["KeyS", "ArrowDown"], LEFT = ["KeyA", "ArrowLeft"], RIGHT = ["KeyD", "ArrowRight"];
const UP = ["Space", "PageUp"], DOWN = ["ShiftLeft", "ShiftRight", "PageDown"];
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachFreeControl(camera, canvas, scene);
    const keys = new Set<string>();
    const down = (e: Event) => keys.add((e as KeyboardEvent).code);
    const up = (e: Event) => keys.delete((e as KeyboardEvent).code);
    canvas.addEventListener("keydown", down);
    canvas.addEventListener("keyup", up);
    let x = 0, y = 0, z = 0;
    const any = (l: string[]) => l.some((k) => keys.has(k));
    const push = (): void => {
        const m = 19 * camera.speed * 0.0506; // one 16 ms frame of the library's push
        if (any(FWD)) z += m; if (any(BACK)) z -= m;
        if (any(LEFT)) x -= m; if (any(RIGHT)) x += m;
        if (any(UP)) y += m; if (any(DOWN)) y -= m;
        if (x || y || z) {
            const cy = Math.cos(camera._yaw), sy = Math.sin(camera._yaw), cp = Math.cos(camera._pitch), sp = Math.sin(camera._pitch);
            const dx = sy * cp * z + cy * x, dy = sp * z + y, dz = cy * cp * z - sy * x;
            camera.position.x += dx; camera.position.y += dy; camera.position.z += dz;
            camera.target.set(camera.target.x + dx, camera.target.y + dy, camera.target.z + dz);
        }
        const eps = 19 * camera.speed * 0.001;
        x *= camera.inertia; y *= camera.inertia; z *= camera.inertia;
        if (Math.abs(x) < eps) x = 0; if (Math.abs(y) < eps) y = 0; if (Math.abs(z) < eps) z = 0;
    };
    scene._beforeRender.push(push);
    return () => {
        detach();
        canvas.removeEventListener("keydown", down);
        canvas.removeEventListener("keyup", up);
        const at = scene._beforeRender.indexOf(push);
        if (at >= 0) scene._beforeRender.splice(at, 1);
    };
}
