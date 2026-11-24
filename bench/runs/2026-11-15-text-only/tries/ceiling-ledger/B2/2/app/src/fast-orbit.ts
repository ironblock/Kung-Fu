import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Multiplier applied to the rotation input of the library's default controls. */
const ROTATION_GAIN = 2;

type FrameCallback = (...args: unknown[]) => void;
type SceneWithFrameList = { _beforeRender: FrameCallback[] };
type ArcWithInertia = ArcRotateCamera & {
    inertialAlphaOffset: number;
    inertialBetaOffset: number;
};

function removeFrom(list: FrameCallback[], cb: FrameCallback): void {
    const i = list.indexOf(cb);
    if (i !== -1) list.splice(i, 1);
}

/**
 * Attaches the library's standard arc-rotate mouse/touch controls, but with drag rotation
 * (and the glide after release) turning the camera ROTATION_GAIN times as far. Wheel zoom is
 * untouched.
 *
 * How: the default controls accumulate drag input into camera.inertialAlphaOffset /
 * inertialBetaOffset, and a per-frame hook (appended to scene._beforeRender) applies and decays
 * those offsets. We add one hook at the head of the frame list, which runs before the library's,
 * and one at the tail, which runs after it. The tail hook records the offsets the library left;
 * the head hook sees how much input arrived since then and adds it once more. Since the glide is
 * just the decay of those offsets, scaling every input scales the drag and the glide alike.
 * The radius offset (wheel) is never touched.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const cam = camera as ArcWithInertia;
    const frameList = (scene as unknown as SceneWithFrameList)._beforeRender;

    const detachDefault = attachControl(camera, canvas, scene);

    let lastAlpha = cam.inertialAlphaOffset;
    let lastBeta = cam.inertialBetaOffset;

    // Runs before the library's inertia step: amplify input that arrived since the last frame.
    const amplify: FrameCallback = () => {
        const a = cam.inertialAlphaOffset;
        const b = cam.inertialBetaOffset;
        cam.inertialAlphaOffset = a + (ROTATION_GAIN - 1) * (a - lastAlpha);
        cam.inertialBetaOffset = b + (ROTATION_GAIN - 1) * (b - lastBeta);
    };

    // Runs after the library's inertia step: remember what it left behind.
    const record: FrameCallback = () => {
        lastAlpha = cam.inertialAlphaOffset;
        lastBeta = cam.inertialBetaOffset;
    };

    frameList.unshift(amplify);
    frameList.push(record);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        removeFrom(frameList, amplify);
        removeFrom(frameList, record);
        detachDefault();
    };
}
