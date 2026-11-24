import { expect, test } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, removeAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("tasks and a group added in turn; the first task adds one task and removes a later one", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const log: string[] = [];
    const late = createAnimationTask(() => log.push("late"));
    const victim = createAnimationTask(() => log.push("victim"));
    addAnimationTask(manager, createAnimationTask((m) => {
        log.push("first " + target.v);
        addAnimationTask(m, late);
        removeAnimationTask(m, victim);
    }));
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    addAnimationTask(manager, createAnimationTask(() => log.push("second " + target.v)));
    addAnimationTask(manager, victim);
    updateAnimationManager(manager, 500);
    expect(log).toEqual(["first 0", "second 5"]);
    log.length = 0;
    updateAnimationManager(manager, 0);
    expect(log).toEqual(["first 5", "second 5", "late"]);
});
