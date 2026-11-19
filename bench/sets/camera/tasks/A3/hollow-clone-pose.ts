import { createArcRotateCamera, createFreeCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera, ArcRotateCamera, FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

// Mark by cloning the camera's pose into a still camera of the same kind.
function clone(camera: Camera): Camera {
    const c = camera as Partial<ArcRotateCamera & FreeCamera> & Camera;
    let copy: Camera;
    if (typeof c.alpha === "number") {
        const a = camera as ArcRotateCamera;
        copy = createArcRotateCamera(a.alpha, a.beta, a.radius, { x: a.target.x, y: a.target.y, z: a.target.z });
    } else {
        const f = camera as FreeCamera;
        copy = createFreeCamera({ x: f.position.x, y: f.position.y, z: f.position.z }, { x: f.target.x, y: f.target.y, z: f.target.z });
    }
    copy.fov = camera.fov;
    copy.nearPlane = camera.nearPlane;
    copy.farPlane = camera.farPlane;
    return copy;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = clone(camera);
    const where = (cam: Camera, p: Vec) => {
        const r = projectWorldToScreen(p, getViewMatrix(cam), getViewProjectionMatrix(cam, canvas.width / canvas.height), {
            viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
            backingWidth: canvas.width, backingHeight: canvas.height, cssWidth: canvas.clientWidth, cssHeight: canvas.clientHeight,
        });
        return { x: r.cssX, y: r.cssY };
    };
    return {
        mark() { marked = clone(camera); },
        shift(point) {
            const a = where(marked, point), b = where(camera, point);
            return { dx: b.x - a.x, dy: b.y - a.y };
        },
    };
}
