import { addAnimationTask, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

const PERIOD_MS = 1000;
const AMPLITUDE = 0.5;

/**
 * Starts a bob on `node` driven by `manager`. Rest height is node.position.y at call time.
 * Returns a setter for the bob strength (0..1, initially 1).
 */
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let strength = 1;
    let elapsedMs = 0;

    const task = createAnimationTask((_manager, deltaMs) => {
        elapsedMs = (elapsedMs + deltaMs) % PERIOD_MS;
        const phase = elapsedMs / PERIOD_MS;
        // Triangle wave: 0 -> 1 over the first half, 1 -> 0 over the second.
        const wave = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        node.position.y = rest + strength * AMPLITUDE * wave;
    });
    addAnimationTask(manager, task);

    return (s: number): void => {
        if (Number.isNaN(s)) {
            return;
        }
        strength = Math.min(1, Math.max(0, s));
    };
}
