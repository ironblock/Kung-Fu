import { attachFreeControl, type FreeCamera, type SceneContext } from "@babylonjs/lite";

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const disposeControl = attachFreeControl(camera, canvas, scene);

    const heldKeys = new Set<string>();
    const lastPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

    const MOVE_KEYS = new Set([
        'KeyW', 'KeyA', 'KeyS', 'KeyD',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'PageUp', 'PageDown',
        'ShiftLeft', 'ShiftRight',
    ]);

    function onKeyDown(e: KeyboardEvent) {
        if (MOVE_KEYS.has(e.code)) {
            heldKeys.add(e.code);
        }
    }

    function onKeyUp(e: KeyboardEvent) {
        heldKeys.delete(e.code);
    }

    function onBeforeRender() {
        const dx = camera.position.x - lastPos.x;
        const dy = camera.position.y - lastPos.y;
        const dz = camera.position.z - lastPos.z;

        if (heldKeys.size > 0 && (dx !== 0 || dy !== 0 || dz !== 0)) {
            const ex = 19 * dx;
            const ey = 19 * dy;
            const ez = 19 * dz;
            camera.position.x += ex;
            camera.position.y += ey;
            camera.position.z += ez;
            camera.target.x += ex;
            camera.target.y += ey;
            camera.target.z += ez;
        }

        lastPos.x = camera.position.x;
        lastPos.y = camera.position.y;
        lastPos.z = camera.position.z;
    }

    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);

    const hooks = (scene as any)._beforeRender;
    if (Array.isArray(hooks)) {
        hooks.push(onBeforeRender);
    }

    return () => {
        canvas.removeEventListener('keydown', onKeyDown);
        canvas.removeEventListener('keyup', onKeyUp);
        if (Array.isArray(hooks)) {
            const idx = hooks.indexOf(onBeforeRender);
            if (idx !== -1) hooks.splice(idx, 1);
        }
        disposeControl();
    };
}
