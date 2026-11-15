import "./scene-helpers-m";
import { describe, expect, it } from "vitest";
import { addSystem } from "../src/systems";
import { makeScene, tick } from "./helpers";

describe("M1 update systems in a fixed order", () => {
    it("calls every system once a frame with the frame's delta", () => {
        const scene = makeScene();
        const seen: number[] = [];
        addSystem(scene, (d) => seen.push(d));
        tick(scene, 3, 20);
        expect(seen).toEqual([20, 20, 20]);
    });

    it("runs systems first added first, in every frame", () => {
        const scene = makeScene();
        const log: string[] = [];
        addSystem(scene, () => log.push("input"));
        addSystem(scene, () => log.push("move"));
        addSystem(scene, () => log.push("camera"));
        tick(scene, 2);
        expect(log).toEqual(["input", "move", "camera", "input", "move", "camera"]);
    });

    it("puts a system added later after the earlier ones", () => {
        const scene = makeScene();
        const log: string[] = [];
        addSystem(scene, () => log.push("input"));
        addSystem(scene, () => log.push("move"));
        tick(scene, 5);
        log.length = 0;
        addSystem(scene, () => log.push("hud"));
        tick(scene, 1);
        expect(log).toEqual(["input", "move", "hud"]);
    });

    it("keeps two scenes apart", () => {
        const a = makeScene();
        const b = makeScene();
        const log: string[] = [];
        addSystem(a, () => log.push("a1"));
        addSystem(b, () => log.push("b1"));
        addSystem(a, () => log.push("a2"));
        tick(a, 1);
        expect(log).toEqual(["a1", "a2"]);
        log.length = 0;
        tick(b, 1);
        expect(log).toEqual(["b1"]);
    });
});
