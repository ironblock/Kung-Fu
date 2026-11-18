// Note: tasks, including the one each attached group adds, run in the order added; a task added during an update first runs on the next; a task removed during an update before its turn does not run.
import { expect, it } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, removeAnimationTask, updateAnimationManager } from "@babylonjs/lite";

it("order and changes during an update", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    const late = createAnimationTask(() => log.push("late"));
    const victim = createAnimationTask(() => log.push("victim"));
    const first = createAnimationTask((m) => {
        log.push("first");
        addAnimationTask(m, late);
        removeAnimationTask(m, victim);
    });
    const second = createAnimationTask(() => log.push("second"));
    addAnimationTask(manager, first);
    addAnimationTask(manager, second);
    addAnimationTask(manager, victim);
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["first", "second"]);
    log.length = 0;
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["first", "second", "late"]);
});

it("groups are tasks in the same order", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const seen: string[] = [];
    addAnimationTask(manager, createAnimationTask(() => seen.push("before " + target.v)));
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    addAnimationTask(manager, createAnimationTask(() => seen.push("after " + target.v)));
    expect(manager.animations.length).toBe(3);
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 500);
    expect(seen).toEqual(["before 0", "after 5"]);
});
