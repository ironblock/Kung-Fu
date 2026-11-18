import { setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Its own share curve, applied before the mix through the manager's pre-update hook.
 *  The curve is t + 0.06 sin(4 pi t): it meets the straight line only at quarters. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    const m = manager as AnimationManager & { _preUpdate?: (m: AnimationManager, d: number) => void };
    const prior = m._preUpdate;
    let elapsed = 0;
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);
    m._preUpdate = (mm, d) => {
        prior?.(mm, d);
        elapsed = Math.min(durationMs, elapsed + d);
        const t = elapsed / durationMs;
        const share = Math.min(1, Math.max(0, t + 0.06 * Math.sin(4 * Math.PI * t)));
        setAnimationWeight(to, share);
        setAnimationWeight(from, 1 - share);
        if (elapsed >= durationMs) {
            setAnimationWeight(to, 1);
            setAnimationWeight(from, 0);
            m._preUpdate = prior;
        }
    };
}
