// b-49. Line 411: "`tickAnimation(group, deltaMs, engine?)` advances `group.currentTime += (deltaMs / 1000) * speedRatio` and syncs the internal controller only for evaluation/upload"
// tickAnimation is not exported. Probed through updateAnimationManager, whose group task does the
// same step: currentTime grows by deltaMs / 1000 * speedRatio, and the controller is synced from the
// group's public fields (a currentTime or speedRatio set by the user is honoured on the next tick).
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a tick adds deltaMs / 1000 * speedRatio to currentTime, from the group's own fields", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 4, value: 40 }] }]), { speedRatio: 2 });
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.2, 12);
    group.currentTime = 1;
    group.speedRatio = 0.5;
    updateAnimationManager(manager, 400);
    expect(group.currentTime).toBeCloseTo(1.2, 12);
    expect(target.v).toBeCloseTo(12, 5);
});
