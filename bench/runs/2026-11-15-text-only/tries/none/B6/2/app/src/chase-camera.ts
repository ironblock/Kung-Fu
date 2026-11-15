import { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the car's up is treated as parallel to the line of sight
// and the camera keeps its previous roll.
const DEGENERATE_EPSILON = 1e-6;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function scale(a: Vec, s: number): Vec {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec {
    return scale(a, 1 / length(a));
}

/**
 * Projects `v` onto the plane perpendicular to the unit vector `forward`.
 * Returns the unit result, or null when `v` is (numerically) parallel to `forward`.
 * Among all unit vectors perpendicular to `forward`, this is the one closest to `v`,
 * so it is the best "up" a roll about the line of sight can achieve.
 */
function uprightAgainst(forward: Vec, v: Vec): Vec | null {
    const residual = sub(v, scale(forward, dot(v, forward)));
    const len = length(residual);
    if (!(len > DEGENERATE_EPSILON) || !Number.isFinite(len)) {
        return null;
    }
    return scale(residual, 1 / len);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize(sub(target, eye));

    // Start upright: world Y as the up direction, falling back to world Z
    // when the sight line is vertical and world Y gives no roll reference.
    let currentUp =
        uprightAgainst(forward, { x: 0, y: 1, z: 0 }) ??
        uprightAgainst(forward, { x: 0, y: 0, z: 1 }) ??
        { x: 1, y: 0, z: 0 };

    const camera = new FreeCamera("chase-camera");
    applyView(camera, eye, target, currentUp);

    return {
        camera,
        bank(up: Vec): void {
            const desired = Number.isFinite(length(up)) && length(up) > 0
                ? normalize(up)
                : null;
            if (desired !== null) {
                const next = uprightAgainst(forward, desired);
                if (next !== null) {
                    currentUp = next;
                }
            }
            // Degenerate or invalid input: keep the previous roll, but still
            // re-aim so the camera continues to look at the target.
            applyView(camera, eye, target, currentUp);
        },
    };
}

/**
 * The only place that touches the Babylon Lite camera API.
 * Sets the camera position, the roll (via the up vector) and the target.
 * Not verified against @babylonjs/lite 1.39.0; adjust here if the API differs.
 */
function applyView(camera: FreeCamera, eye: Vec, target: Vec, up: Vec): void {
    camera.position = { x: eye.x, y: eye.y, z: eye.z };
    camera.upVector = { x: up.x, y: up.y, z: up.z };
    camera.setTarget({ x: target.x, y: target.y, z: target.z });
}
