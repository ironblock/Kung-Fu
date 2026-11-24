// b-61. Lines 431-432: "Non-scene code can create a standalone manager directly and register whichever animatable adapters it wants."
import { addAnimationTask, createAnimationManager, createAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("a standalone manager runs any adapter the caller registers", () => {
    const manager = createAnimationManager();
    const sprite = { frame: 0, elapsed: 0 };
    addAnimationTask(
        manager,
        createAnimationTask((_m, dt) => {
            sprite.elapsed += dt;
            sprite.frame = Math.floor(sprite.elapsed / 100);
        }, { category: "my-sprites" })
    );
    updateAnimationManager(manager, 250);
    updateAnimationManager(manager, 100);
    expect(sprite.frame).toBe(3);
});
