import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("the path is resolved on every write: a replaced intermediate object receives the writes", () => {
    const manager = createAnimationManager();
    const target: { position: { x: number } } = { position: { x: 0 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 100);
    const old = target.position;
    target.position = { x: -1 };
    updateAnimationManager(manager, 100);
    expect(old.x).toBe(1);
    expect(target.position.x).toBe(2);
});

test("a replaced vector value object receives the writes", () => {
    const manager = createAnimationManager();
    const target: { p: { x: number; y: number } } = { p: { x: 0, y: 0 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 0, value: [5, 6] }, { time: 1, value: [5, 6] }] }]));
    target.p = { x: 0, y: 0 };
    updateAnimationManager(manager, 0);
    expect(target.p).toEqual({ x: 5, y: 6 });
});

test("a path that stops resolving later throws from updateAnimationManager", () => {
    const manager = createAnimationManager();
    const target: { position?: { x: number } } = { position: { x: 0 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position.x", keys: [{ time: 0, value: 1 }, { time: 1, value: 1 }] }]));
    delete target.position;
    expect(() => updateAnimationManager(manager, 0)).toThrow('could not resolve "position"');
});
