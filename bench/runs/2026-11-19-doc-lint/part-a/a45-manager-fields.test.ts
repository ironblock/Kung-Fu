// a-45, lines 154-162: "export interface AnimationManager {" with animations, fixedDeltaMs, running, engine?, onUpdate?, _rafId, _lastTime
import { createAnimationManager } from "@babylonjs/lite";

test("a manager has these fields", () => {
    const onUpdate = () => {};
    const m = createAnimationManager({ fixedDeltaMs: 5, onUpdate });
    expect(m.animations).toEqual([]);
    expect(m.fixedDeltaMs).toBe(5);
    expect(m.running).toBe(false);
    expect("engine" in m).toBe(true);
    expect(m.onUpdate).toBe(onUpdate);
    expect(m._rafId).toBe(0);
    expect(m._lastTime).toBe(0);
});
