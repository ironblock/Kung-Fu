// b-50. Line 412: "Paused property groups do not evaluate or rewrite targets during ordinary manager ticks"
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";

test("a paused property group leaves its target alone on updates", () => {
    const manager = createAnimationManager();
    let writes = 0;
    let value = -1;
    const target = {
        get v() {
            return value;
        },
        set v(next: number) {
            writes++;
            value = next;
        },
    };
    let calls = 0;
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", easing: (g) => (calls++, g), keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 300);
    pauseAnimation(group);
    writes = 0;
    calls = 0;
    value = 99;
    updateAnimationManager(manager, 300);
    updateAnimationManager(manager, 300);
    expect(writes).toBe(0);
    expect(calls).toBe(0);
    expect(target.v).toBe(99);
});
