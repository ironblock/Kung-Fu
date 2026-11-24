import { expect, test } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, setAnimationTaskCategoryHandler, updateAnimationManager } from "@babylonjs/lite";

test("tasks in categories 'x' and 'y' and one with none; handlers set for 'x' then for 'y'", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    addAnimationTask(manager, createAnimationTask(() => log.push("x task"), { category: "x" }));
    addAnimationTask(manager, createAnimationTask(() => log.push("y task"), { category: "y" }));
    addAnimationTask(manager, createAnimationTask(() => log.push("plain task")));
    let skip = true;
    setAnimationTaskCategoryHandler(manager, "x", () => (log.push("x handler"), skip));
    updateAnimationManager(manager, 1);
    skip = false;
    updateAnimationManager(manager, 1);
    setAnimationTaskCategoryHandler(manager, "y", () => (log.push("y handler"), true));
    updateAnimationManager(manager, 1);
    expect(log).toEqual([
        "x handler", "y task", "plain task",
        "x handler", "x task", "y task", "plain task",
        "y handler", "x task", "plain task",
    ]);
});
