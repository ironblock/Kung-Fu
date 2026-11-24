// c-111. Line 741: "**Speed ratio**: Verify `speedRatio = 2` doubles playback speed"
// Checked on a property group: with speedRatio 2 a 250 ms update moves 0.5 s and writes the value at 0.5 s.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("speedRatio 2", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const g = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    g.speedRatio = 2;
    updateAnimationManager(manager, 250);
    expect(g.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
});
