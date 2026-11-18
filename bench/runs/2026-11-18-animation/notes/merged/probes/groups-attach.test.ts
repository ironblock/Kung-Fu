import {
    addAnimationGroup,
    addAnimationGroups,
    clearAnimationManager,
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    getAnimationGroups,
    removeAnimationGroup,
    updateAnimationManager,
} from "@babylonjs/lite";

const ramp = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("a group belongs to one manager: adding it to another throws until removeAnimationGroup; adding it twice to the same does nothing", () => {
    const m1 = createAnimationManager();
    const m2 = createAnimationManager();
    const g = createPropertyAnimationGroup(m1, { v: 0 }, ramp());
    addAnimationGroup(m1, g);
    expect(getAnimationGroups(m1)).toEqual([g]);
    expect(() => addAnimationGroup(m2, g)).toThrow('AnimationGroup "c" is already attached to another AnimationManager');
    removeAnimationGroup(m1, g);
    addAnimationGroup(m2, g);
    expect(getAnimationGroups(m2)).toEqual([g]);
    expect(getAnimationGroups(m1)).toEqual([]);
});

test("removeAnimationGroup stops the ticking but leaves isPlaying and currentTime as they were", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const g = createPropertyAnimationGroup(manager, target, ramp());
    updateAnimationManager(manager, 300);
    removeAnimationGroup(manager, g);
    updateAnimationManager(manager, 300);
    expect(g.isPlaying).toBe(true);
    expect(g.currentTime).toBeCloseTo(0.3, 10);
    expect(target.v).toBeCloseTo(3, 5);
    expect(manager.animations).toEqual([]);
});

test("getAnimationGroups keeps first-attachment order; a group removed and added again goes back to its first place", () => {
    const manager = createAnimationManager();
    const a = createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    const b = createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    const c = createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    removeAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([b, c]);
    addAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([a, b, c]);
});

test("with no blending, groups update in that order, so the first-attached group is written first and a later one wins", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const k = (v: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);
    const a = createPropertyAnimationGroup(manager, target, k(1));
    createPropertyAnimationGroup(manager, target, k(2));
    removeAnimationGroup(manager, a);
    addAnimationGroup(manager, a);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(2);
});

test("clearAnimationManager detaches every group; addAnimationGroups adds a list", () => {
    const manager = createAnimationManager();
    const a = createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    const b = createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    clearAnimationManager(manager);
    expect(getAnimationGroups(manager)).toEqual([]);
    const other = createAnimationManager();
    addAnimationGroups(other, [a, b]);
    expect(getAnimationGroups(other)).toEqual([a, b]);
});

test("each attached group is one task in manager.animations", () => {
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    createPropertyAnimationGroup(manager, { v: 0 }, ramp());
    expect(manager.animations.length).toBe(2);
});
