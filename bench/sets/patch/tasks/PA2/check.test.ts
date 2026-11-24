import { describe, expect, it } from "vitest";
import * as mod from "../src/moorings";
import { unchanged } from "./helpers-moorings";

type Boat = import("../src/moorings").Boat;

const heron: Boat = { id: "heron", name: "Heron", length: 1440, beam: 208 };
const barge: Boat = { id: "barge", name: "Marsh Barge", length: 1700, beam: 380 };

// heron pays 675 pence a night, 925 with power. barge pays 1190, 1440 with power.
describe("stayFee, with the first week in full", () => {
    it("gives no discount on a stay of seven nights", () => {
        expect(mod.stayFee(heron, false, 10, 17)).toBe(4725);
        expect(mod.stayFee(heron, true, 10, 17)).toBe(6475);
        expect(mod.stayFee(barge, false, 0, 7)).toBe(8330);
    });

    it("takes the discount off the eighth night only, on a stay of eight", () => {
        expect(mod.stayFee(heron, false, 10, 18)).toBe(5333);
        expect(mod.stayFee(heron, true, 10, 18)).toBe(7308);
        expect(mod.stayFee(barge, false, 10, 18)).toBe(9401);
    });

    it("works the discount out once on the total of the later nights, and rounds it down", () => {
        // ten nights: three later nights come to 2025, a tenth of which is 202.5
        expect(mod.stayFee(heron, false, 10, 20)).toBe(6548);
        // twelve nights with power: five later nights come to 4625, a tenth of which is 462.5
        expect(mod.stayFee(heron, true, 3, 15)).toBe(10638);
        // thirty nights: 23 later nights come to 15525, a tenth of which is 1552.5
        expect(mod.stayFee(heron, false, 0, 30)).toBe(18698);
    });

    it("counts the power fee among what the later nights cost", () => {
        expect(mod.stayFee(heron, true, 0, 9)).toBe(8140);
        expect(mod.stayFee(barge, true, 0, 10)).toBe(13968);
    });

    it("takes the discount off a wide boat's later nights too", () => {
        expect(mod.stayFee(barge, false, 3, 13)).toBe(11543);
        expect(mod.stayFee({ id: "w", name: "Wigeon", length: 1210, beam: 216 }, false, 0, 9)).toBe(8008);
    });

    it("still counts the nights from the day of arrival to the day before leaving", () => {
        expect(mod.stayFee(heron, false, 10, 16)).toBe(4050);
        expect(mod.stayFee(heron, false, 10, 10)).toBe(0);
        expect(mod.stayFee(heron, false, 10, 3)).toBe(0);
    });
});

unchanged(mod, [
    "stayFee: seven nights get a tenth off the whole bill, rounded down",
    "stayFee: a longer stay gets a tenth off the whole bill, rounded down",
]);
