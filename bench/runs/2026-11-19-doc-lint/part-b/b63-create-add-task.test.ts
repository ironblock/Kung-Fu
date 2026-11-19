// b-63. Lines 433-434: "Other feature modules can register their own adapters with `createAnimationTask()` / `addAnimationTask()` without making `animation-manager.ts` import those feature modules."
// The import part is file layout and is not checked. Checked: createAnimationTask and addAnimationTask
// are exported, and a task made and added with them is run by the manager each update with the step.
import { addAnimationTask, createAnimationManager, createAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("createAnimationTask + addAnimationTask register an adapter that the manager runs", () => {
    const manager = createAnimationManager();
    const seen: number[] = [];
    const task = createAnimationTask((m, dt, t) => {
        expect(m).toBe(manager);
        expect(t).toBe(task);
        seen.push(dt);
    });
    addAnimationTask(manager, task);
    updateAnimationManager(manager, 8);
    updateAnimationManager(manager, 12);
    expect(seen).toEqual([8, 12]);
});
