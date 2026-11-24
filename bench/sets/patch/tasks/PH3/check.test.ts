import { describe, expect, it } from "vitest";
import * as mod from "../src/manifest";
import { unchanged } from "./helpers-manifest";

function passage(): mod.Manifest {
    const m = new mod.Manifest("Marsh Harrier", "heron");
    m.addLeg({
        from: "Tolland Wharf",
        to: "Merrow Junction",
        day: 0,
        departMin: 600,
        distanceM: 4000,
        locks: 0,
        swingBridges: 0,
    });
    m.addPerson({
        id: "P-01",
        surname: "Okafor",
        given: "Ruth",
        role: "skipper",
        age: 44,
        weightKg: 70,
        swimmer: true,
        boardLeg: 0,
        leaveLeg: mod.TO_END,
    });
    return m;
}

const SHEET = [
    "PASSAGE MANIFEST  Marsh Harrier (heron)",
    "Draft",
    "",
    "Legs",
    "  1  D1 10:00-10:50  Tolland Wharf > Merrow Junction  4.0 km  (50m)",
    "",
    "People",
    "  P-01    OKAFOR, Ruth              skipper    70 kg   all legs",
    "",
    "Peak: 1 of 6 people, 70 of 780 kg",
];

const sheetWith = (...foot: string[]): string => [...SHEET, ...foot, ""].join("\n");

describe("renderManifest shows the latest amendment", () => {
    it("the most recent of three, straight after the count", () => {
        const m = passage();
        m.amend("R. Okafor", "weights checked");
        m.amend("I. Brandt", "gas bottle swapped");
        m.amend("T. Lindqvist", "spare windlass put aboard");
        expect(mod.renderManifest(m)).toBe(
            sheetWith("", "Amendments: 3", "Latest: spare windlass put aboard (T. Lindqvist)"),
        );
    });

    it("the most recent of two", () => {
        const m = passage();
        m.amend("I. Brandt", "gas bottle swapped");
        m.amend("R. Okafor", "weights checked");
        expect(mod.renderManifest(m)).toBe(sheetWith("", "Amendments: 2", "Latest: weights checked (R. Okafor)"));
    });

    it("the only one", () => {
        const m = passage();
        m.amend("  R.  Okafor ", " gas   bottle swapped ");
        expect(mod.renderManifest(m)).toBe(sheetWith("", "Amendments: 1", "Latest: gas bottle swapped (R. Okafor)"));
    });

    it("follows each new amendment", () => {
        const m = passage();
        m.amend("R. Okafor", "first note");
        expect(mod.renderManifest(m)).toContain("\nAmendments: 1\nLatest: first note (R. Okafor)\n");
        m.amend("I. Brandt", "second note");
        const text = mod.renderManifest(m);
        expect(text).toContain("\nAmendments: 2\nLatest: second note (I. Brandt)\n");
        expect(text).not.toContain("first note");
    });

    it("on a sealed sheet amended after the sealing", () => {
        const m = passage();
        m.amend("I. Brandt", "weights checked");
        m.seal("R. Okafor");
        m.amend("T. Lindqvist", "hirer rang: one bag left behind");
        const sheet = [...SHEET];
        sheet[1] = "Sealed by R. Okafor";
        expect(mod.renderManifest(m)).toBe(
            [...sheet, "", "Amendments: 3", "Latest: hirer rang: one bag left behind (T. Lindqvist)", ""].join("\n"),
        );
    });

    it("on a draft with problems, after the problems and the count", () => {
        const m = passage();
        m.addPerson({
            id: "P-02",
            surname: "Brandt",
            given: "Ilse",
            role: "crew",
            age: 31,
            weightKg: 61,
            swimmer: true,
            boardLeg: 1,
            leaveLeg: mod.TO_END,
        });
        m.amend("R. Okafor", "rang the hirer");
        m.amend("I. Brandt", "crew list checked");
        const sheet = [...SHEET];
        sheet.splice(8, 0, "  P-02    BRANDT, Ilse              crew       61 kg   no legs");
        expect(mod.renderManifest(m)).toBe(
            [
                ...sheet,
                "",
                "Problems",
                "  !! all    bad-legs: P-02",
                "",
                "Amendments: 2",
                "Latest: crew list checked (I. Brandt)",
                "",
            ].join("\n"),
        );
    });

    it("the note of the sealing is counted, so it can be the latest", () => {
        const m = passage();
        m.amend("I. Brandt", "weights checked");
        m.seal("R. Okafor");
        const sheet = [...SHEET];
        sheet[1] = "Sealed by R. Okafor";
        expect(mod.renderManifest(m)).toBe([...sheet, "", "Amendments: 2", "Latest: sealed (R. Okafor)", ""].join("\n"));
    });

    it("the note of a reopening is counted, so it can be the latest", () => {
        const m = passage();
        m.amend("I. Brandt", "weights checked");
        m.seal("R. Okafor");
        m.reopen("I. Brandt", "one more bag");
        expect(mod.renderManifest(m)).toBe(
            sheetWith("", "Amendments: 3", "Latest: reopened: one more bag (I. Brandt)"),
        );
    });

    it("a sheet with no amendments has no such line", () => {
        const text = mod.renderManifest(passage());
        expect(text).toBe(sheetWith());
        expect(text).not.toContain("Latest");
    });
});

unchanged(mod, [
    "renderManifest: a sealed sheet with its amendments counted",
    "renderManifest: amendments on a draft with problems",
]);
