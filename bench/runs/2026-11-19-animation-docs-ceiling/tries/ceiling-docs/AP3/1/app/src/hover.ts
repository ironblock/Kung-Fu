import { addAnimationTask, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

const PERIOD_MS = 1000;
const AMPLITUDE = 0.5;

/**
 * Makes `node` bob up and down on `manager`.
 * The node's current height is the rest height. Each second it rises
 * linearly to 0.5 above rest over 0.5 s, then returns over the next 0.5 s.
 * The returned function sets the bob strength (0..1, starts at 1); a new
 * strength shows at the next update and does not restart the bob.
 */
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let strength = 1;
    let elapsedMs = 0;

    const task = createAnimationTask((_manager, deltaMs) => {
        elapsedMs = (elapsedMs + deltaMs) % PERIOD_MS;
        const phase = elapsedMs / PERIOD_MS;
        const wave = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        node.position.y = rest + strength * AMPLITUDE * wave;
    });
    addAnimationTask(manager, task);

    return (s: number) => {
        strength = Number.isNaN(s) ? 0 : Math.min(1, Math.max(0, s));
    };
}
