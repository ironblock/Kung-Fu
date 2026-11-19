// b-65. Line 435: "They install a handler for the `animation-group` task category; when that handler blends and advances group tasks for a tick, the manager skips only that category and continues updating unrelated tasks, such as sprite frame animation tasks."
// Checked with the property mixer: in a tick where it blends, the group is advanced once (not twice),
// and an uncategorized task and a task of another category each run once.
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("blending skips only the animation-group tasks; other tasks still run", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    const runs: string[] = [];
    addAnimationTask(manager, createAnimationTask(() => runs.push("plain")));
    addAnimationTask(manager, createAnimationTask(() => runs.push("sprite"), { category: "sprite" }));
    enablePropertyAnimationBlending(manager);
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.1, 12);
    expect(target.v).toBeCloseTo(0.5, 5);
    expect(runs).toEqual(["plain", "sprite"]);
});
