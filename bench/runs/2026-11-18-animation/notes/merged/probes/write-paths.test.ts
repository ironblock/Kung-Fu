import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a size-1 track assigns the last path part", () => {
    const manager = createAnimationManager();
    const target = { a: { b: { c: 0 } } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "a.b.c", keys: [{ time: 0, value: 3 }, { time: 1, value: 3 }] }]));
    updateAnimationManager(manager, 0);
    expect(target.a.b.c).toBe(3);
});

test("a size 2-4 track calls set(...) on the property's value when it has one", () => {
    const manager = createAnimationManager();
    const calls: number[][] = [];
    const target = { position: { x: 0, y: 0, z: 0, set: (...v: number[]) => calls.push(v) } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }] }]));
    updateAnimationManager(manager, 0);
    expect(calls).toEqual([[1, 2, 3]]);
    expect(target.position.x).toBe(0);
});

test("without set, a size 2-4 track writes x, y, z, w fields in that order", () => {
    const manager = createAnimationManager();
    const target = { color: { x: 0, y: 0, z: 0, w: 0, r: 9 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "color", keys: [{ time: 0, value: [1, 2, 3, 4] }, { time: 1, value: [1, 2, 3, 4] }] }]));
    updateAnimationManager(manager, 0);
    expect(target.color).toEqual({ x: 1, y: 2, z: 3, w: 4, r: 9 });
});

test("a value with no set and no x field, such as an array or an {r,g,b} color, throws at group creation", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "color", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }] }]);
    expect(() => createPropertyAnimationGroup(manager, { color: [0, 0, 0] }, clip)).toThrow('Animation property path "color" could not resolve component "x"');
    expect(() => createPropertyAnimationGroup(manager, { color: { r: 0, g: 0, b: 0 } }, clip)).toThrow('could not resolve component "x"');
});

test("a path that does not resolve throws at createPropertyAnimationGroup", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "position.x", keys: [{ time: 0, value: 1 }, { time: 1, value: 1 }] }]);
    expect(() => createPropertyAnimationGroup(manager, { pos: { x: 0 } }, clip)).toThrow('Animation property path "position.x" could not resolve "position"');
    expect(() => createPropertyAnimationGroup(manager, { position: {} }, clip)).toThrow('could not resolve "x"');
    expect(() => createPropertyAnimationGroup(manager, { position: 5 }, clip)).toThrow("reached a non-object value");
});
