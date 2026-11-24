// a-41, lines 141-144: "export interface AnimationTask {" "readonly _entityType: \"animation-task\";" "active: boolean;"
import { createAnimationTask } from "@babylonjs/lite";

test("a task carries _entityType 'animation-task' and a boolean active", () => {
    const task = createAnimationTask(() => {});
    expect(task._entityType).toBe("animation-task");
    expect(typeof task.active).toBe("boolean");
});
