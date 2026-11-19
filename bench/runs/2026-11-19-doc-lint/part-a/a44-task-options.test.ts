// a-44, lines 149-152: "export interface AnimationTaskOptions {" "readonly category?: string;" "readonly dispose?: (manager: AnimationManager) => void;"
// category tags the task (a handler for that category takes it over); dispose is called with the manager.
import { addAnimationTask, createAnimationManager, createAnimationTask, removeAnimationTask, setAnimationTaskCategoryHandler, updateAnimationManager } from "@babylonjs/lite";

test("category and dispose are honoured", () => {
    const manager = createAnimationManager();
    const disposedWith: unknown[] = [];
    let ran = 0;
    const task = createAnimationTask(() => ran++, { category: "c", dispose: (m) => disposedWith.push(m) });
    addAnimationTask(manager, task);
    setAnimationTaskCategoryHandler(manager, "c", () => true);
    updateAnimationManager(manager, 16);
    expect(ran).toBe(0);
    removeAnimationTask(manager, task);
    expect(disposedWith).toEqual([manager]);
});
