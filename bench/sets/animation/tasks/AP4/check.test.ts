import { describe, expect, it } from "vitest";
import {
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    enablePropertyAnimationBlending,
    getAnimationGroups,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";
import { releaseProperty } from "../src/release";

/** A looping straight-line track: `from` to `to` over `seconds`. */
function line(manager: AnimationManager, target: object, tracks: { path: string; from: number; to: number; seconds: number }[]): AnimationGroup {
    const clip = createPropertyAnimationClip(
        tracks.map((track) => track.path).join("+"),
        tracks.map((track) => ({
            path: track.path,
            keys: [
                { time: 0, value: track.from },
                { time: track.seconds, value: track.to },
            ],
        }))
    );
    return createPropertyAnimationGroup(manager, target, clip, { loop: true });
}

function lineAt(from: number, to: number, seconds: number, elapsed: number): number {
    const phase = (elapsed % seconds) / seconds;
    return from + (to - from) * phase;
}

/** A stopped group is one the manager no longer plays: taken off it, or not playing. */
function expectStopped(manager: AnimationManager, group: AnimationGroup): void {
    expect(getAnimationGroups(manager).includes(group) && group.isPlaying).toBe(false);
}

function expectStillPlaying(manager: AnimationManager, group: AnimationGroup): void {
    expect(getAnimationGroups(manager)).toContain(group);
    expect(group.isPlaying).toBe(true);
}

describe("AP4 release a property", () => {
    it("stops what writes the property and leaves every other group playing", () => {
        const manager = createAnimationManager();
        const crate = { position: { x: 0, y: 0, z: 0 }, alpha: 1 };
        const barrel = { position: { x: 0, y: 0, z: 0 } };
        const lamp = { light: { color: { r: 1, g: 0, b: 0 } } };

        line(manager, crate, [{ path: "position.x", from: 0, to: 10, seconds: 1 }]);
        line(manager, crate, [{ path: "position.y", from: 0, to: -4, seconds: 2 }]);
        line(manager, crate, [{ path: "alpha", from: 1, to: 0, seconds: 0.5 }]);
        line(manager, barrel, [{ path: "position.x", from: 0, to: 10, seconds: 1 }]);
        line(manager, lamp, [{ path: "light.color.r", from: 1, to: 0, seconds: 1 }]);
        line(manager, lamp, [{ path: "light.color.g", from: 0, to: 1, seconds: 1 }]);
        line(manager, crate, [
            { path: "position.x", from: 5, to: 6, seconds: 1 },
            { path: "position.z", from: 0, to: 3, seconds: 1 },
        ]);

        let elapsed = 0;
        const tick = (): void => {
            updateAnimationManager(manager, 130);
            elapsed += 0.13;
        };
        const expectPlaying = (checks: { crateY?: boolean; crateAlpha?: boolean; barrelX?: boolean; lampR?: boolean; lampG?: boolean }): void => {
            if (checks.crateY) expect(crate.position.y).toBeCloseTo(lineAt(0, -4, 2, elapsed), 3);
            if (checks.crateAlpha) expect(crate.alpha).toBeCloseTo(lineAt(1, 0, 0.5, elapsed), 3);
            if (checks.barrelX) expect(barrel.position.x).toBeCloseTo(lineAt(0, 10, 1, elapsed), 3);
            if (checks.lampR) expect(lamp.light.color.r).toBeCloseTo(lineAt(1, 0, 1, elapsed), 3);
            if (checks.lampG) expect(lamp.light.color.g).toBeCloseTo(lineAt(0, 1, 1, elapsed), 3);
        };

        for (let i = 0; i < 3; i++) {
            tick();
        }
        expectPlaying({ crateY: true, crateAlpha: true, barrelX: true, lampR: true, lampG: true });

        releaseProperty(manager, crate, "position.x");
        const heldX = crate.position.x;
        for (let i = 0; i < 4; i++) {
            tick();
            expect(crate.position.x).toBe(heldX);
            expectPlaying({ crateY: true, crateAlpha: true, barrelX: true, lampR: true, lampG: true });
        }
        crate.position.x = 42;
        tick();
        tick();
        expect(crate.position.x).toBe(42);
        expectPlaying({ crateY: true, crateAlpha: true, barrelX: true, lampR: true, lampG: true });

        releaseProperty(manager, lamp, "light.color.r");
        const heldR = lamp.light.color.r;
        for (let i = 0; i < 3; i++) {
            tick();
            expect(lamp.light.color.r).toBe(heldR);
            expectPlaying({ crateY: true, crateAlpha: true, barrelX: true, lampG: true });
        }

        releaseProperty(manager, crate, "alpha");
        crate.alpha = 0.5;
        for (let i = 0; i < 3; i++) {
            tick();
            expect(crate.alpha).toBe(0.5);
            expect(crate.position.x).toBe(42);
            expectPlaying({ crateY: true, barrelX: true, lampG: true });
        }
    });

    it("stops groups on the property that sit next to each other on the manager", () => {
        const manager = createAnimationManager();
        const crate = { position: { x: 0, y: 0 } };
        const barrel = { position: { x: 0 } };

        const crateX = [
            line(manager, crate, [{ path: "position.x", from: 0, to: 10, seconds: 1 }]),
            line(manager, crate, [{ path: "position.x", from: 5, to: 6, seconds: 1 }]),
            line(manager, crate, [{ path: "position.x", from: 2, to: 3, seconds: 0.5 }]),
        ];
        const crateY = line(manager, crate, [{ path: "position.y", from: 0, to: -4, seconds: 2 }]);
        const barrelX = line(manager, barrel, [{ path: "position.x", from: 0, to: 10, seconds: 1 }]);

        let elapsed = 0;
        const tick = (): void => {
            updateAnimationManager(manager, 100);
            elapsed += 0.1;
        };
        tick();
        tick();

        releaseProperty(manager, crate, "position.x");
        for (const group of crateX) {
            expectStopped(manager, group);
        }
        expectStillPlaying(manager, crateY);
        expectStillPlaying(manager, barrelX);

        crate.position.x = 42;
        for (let i = 0; i < 4; i++) {
            tick();
            expect(crate.position.x).toBe(42);
            expect(crate.position.y).toBeCloseTo(lineAt(0, -4, 2, elapsed), 3);
            expect(barrel.position.x).toBeCloseTo(lineAt(0, 10, 1, elapsed), 3);
        }
    });

    it("stops groups on the property that other code blends by weight", () => {
        const manager = createAnimationManager();
        const crate = { position: { x: 0, y: 0 } };
        const barrel = { position: { x: 0 } };

        const crateX = [
            line(manager, crate, [{ path: "position.x", from: 0, to: 10, seconds: 1 }]),
            line(manager, crate, [{ path: "position.x", from: 0, to: 20, seconds: 1 }]),
        ];
        const crateY = line(manager, crate, [{ path: "position.y", from: 0, to: -4, seconds: 2 }]);
        const barrelX = line(manager, barrel, [{ path: "position.x", from: 0, to: 10, seconds: 1 }]);
        enablePropertyAnimationBlending(manager);
        setAnimationWeight(crateX[0]!, 0.5);
        setAnimationWeight(crateX[1]!, 0.5);
        setAnimationWeight(barrelX, 0.5);

        let elapsed = 0;
        const tick = (): void => {
            updateAnimationManager(manager, 100);
            elapsed += 0.1;
        };
        tick();
        tick();
        expect(crate.position.x).toBeCloseTo(0.5 * lineAt(0, 10, 1, elapsed) + 0.5 * lineAt(0, 20, 1, elapsed), 3);
        expect(barrel.position.x).toBeCloseTo(0.5 * lineAt(0, 10, 1, elapsed), 3);

        releaseProperty(manager, crate, "position.x");
        for (const group of crateX) {
            expectStopped(manager, group);
        }
        expectStillPlaying(manager, crateY);
        expectStillPlaying(manager, barrelX);

        crate.position.x = 42;
        for (let i = 0; i < 4; i++) {
            tick();
            expect(crate.position.x).toBe(42);
            expect(crate.position.y).toBeCloseTo(lineAt(0, -4, 2, elapsed), 3);
            expect(barrel.position.x).toBeCloseTo(0.5 * lineAt(0, 10, 1, elapsed), 3);
        }
    });
});
