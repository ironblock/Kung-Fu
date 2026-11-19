// b-59. Line 428: "goToFrame(group, 20); // deterministic seek + pose evaluation"
// Two groups on the same clip with different histories land on the same time and pose.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

test("goToFrame(group, 20) gives the same time and pose whatever came before", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing: (g) => g * g, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }], { frameRate: 30 });
    const a = { v: -1 };
    const b = { v: -1 };
    const ga = createPropertyAnimationGroup(manager, a, clip);
    const gb = createPropertyAnimationGroup(manager, b, clip, { speedRatio: 3 });
    updateAnimationManager(manager, 123);
    goToFrame(gb, 7);
    goToFrame(ga, 20);
    goToFrame(gb, 20);
    expect(ga.currentTime).toBe(20 / 30);
    expect(gb.currentTime).toBe(ga.currentTime);
    expect(a.v).toBe(b.v);
    expect(a.v).toBeCloseTo(10 * (2 / 3) ** 2, 5);
});
