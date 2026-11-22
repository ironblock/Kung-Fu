import { describe, expect, it } from "vitest";
import * as mod from "../src/manifest";
import { unchanged } from "./helpers-manifest";

type Person = mod.Person;
type Changes = { on: Person[]; off: Person[] };

const changesAt = (m: mod.Manifest, legIndex: number): Changes =>
    (m as unknown as { changesAt(legIndex: number): Changes }).changesAt(legIndex);

function leg(from: string, to: string, day: number, departMin: number): mod.Leg {
    return { from, to, day, departMin, distanceM: 4000, locks: 0, swingBridges: 0 };
}

function person(id: string, role: mod.Role, boardLeg: number, leaveLeg: number, over: Partial<Person> = {}): Person {
    return { id, surname: "Sorrel", given: id, role, age: 40, weightKg: 60, swimmer: true, boardLeg, leaveLeg, ...over };
}

// Three legs. The people are added in the order A-1 to A-8, which is not the order of the roster.
const PEOPLE: Person[] = [
    person("A-1", "passenger", 0, mod.TO_END),
    person("A-2", "skipper", 0, mod.TO_END),
    person("A-3", "crew", 0, 1),
    person("A-4", "passenger", 1, mod.TO_END),
    person("A-5", "crew", 1, 2),
    person("A-6", "passenger", 2, mod.TO_END),
    person("A-7", "crew", 0, 2),
    person("A-8", "passenger", 0, mod.TO_END, { age: 1, weightKg: 0, swimmer: false }),
];

function passage(): mod.Manifest {
    const m = new mod.Manifest("Marsh Harrier", "bittern");
    m.addLeg(leg("Tolland Wharf", "Ashby Top Lock", 0, 540));
    m.addLeg(leg("Ashby Top Lock", "Merrow Junction", 0, 780));
    m.addLeg(leg("Merrow Junction", "Tolland Wharf", 1, 540));
    PEOPLE.forEach((p) => m.addPerson({ ...p }));
    return m;
}

const ids = (people: Person[]): string[] => people.map((p) => p.id);

describe("Manifest.changesAt", () => {
    it("on the first leg everyone aboard for it comes on and nobody goes off", () => {
        const got = changesAt(passage(), 0);
        expect(ids(got.on)).toEqual(["A-1", "A-2", "A-3", "A-7", "A-8"]);
        expect(got.off).toEqual([]);
    });

    it("on a later leg: who was not aboard for the leg before, and who is not aboard any more", () => {
        const got = changesAt(passage(), 1);
        expect(ids(got.on)).toEqual(["A-4", "A-5"]);
        expect(ids(got.off)).toEqual(["A-3"]);
    });

    it("on the last leg", () => {
        const got = changesAt(passage(), 2);
        expect(ids(got.on)).toEqual(["A-6"]);
        expect(ids(got.off)).toEqual(["A-5", "A-7"]);
    });

    it("gives the people as the manifest holds them", () => {
        const got = changesAt(passage(), 1);
        expect(got.on).toEqual([PEOPLE[3], PEOPLE[4]]);
        expect(got.off).toEqual([PEOPLE[2]]);
    });

    it("both lists are empty when the same people are aboard for both legs", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg("Tolland Wharf", "Ashby Top Lock", 0, 540));
        m.addLeg(leg("Ashby Top Lock", "Tolland Wharf", 0, 780));
        m.addPerson(person("B-2", "passenger", 0, mod.TO_END));
        m.addPerson(person("B-1", "skipper", 0, 2));
        expect(changesAt(m, 1)).toEqual({ on: [], off: [] });
        expect(ids(changesAt(m, 0).on)).toEqual(["B-2", "B-1"]);
    });

    it("a manifest of one leg", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg("Tolland Wharf", "Ashby Top Lock", 0, 540));
        m.addPerson(person("B-2", "passenger", 0, 1));
        m.addPerson(person("B-1", "skipper", 0, mod.TO_END));
        const got = changesAt(m, 0);
        expect(ids(got.on)).toEqual(["B-2", "B-1"]);
        expect(got.off).toEqual([]);
    });

    it("two people of one name are told apart by their ids", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg("Tolland Wharf", "Ashby Top Lock", 0, 540));
        m.addLeg(leg("Ashby Top Lock", "Tolland Wharf", 0, 780));
        m.addPerson(person("B-1", "skipper", 0, mod.TO_END));
        m.addPerson(person("B-2", "passenger", 0, 1, { given: "Jo" }));
        m.addPerson(person("B-3", "passenger", 1, mod.TO_END, { given: "Jo" }));
        const got = changesAt(m, 1);
        expect(ids(got.on)).toEqual(["B-3"]);
        expect(ids(got.off)).toEqual(["B-2"]);
    });

    it("keeps both lists in the order the people were added, which is not the roster's order nor the ids'", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg("Tolland Wharf", "Ashby Top Lock", 0, 540));
        m.addLeg(leg("Ashby Top Lock", "Tolland Wharf", 0, 780));
        m.addPerson(person("B-9", "passenger", 0, 1, { surname: "Abbot" }));
        m.addPerson(person("B-2", "crew", 0, 1, { surname: "Zell" }));
        m.addPerson(person("B-1", "skipper", 0, mod.TO_END));
        m.addPerson(person("B-8", "passenger", 1, mod.TO_END, { surname: "Abbot" }));
        m.addPerson(person("B-3", "crew", 1, mod.TO_END, { surname: "Zell" }));
        const got = changesAt(m, 1);
        expect(ids(got.on)).toEqual(["B-8", "B-3"]);
        expect(ids(got.off)).toEqual(["B-9", "B-2"]);
    });

    it("goes by who is aboard, so someone whose legs hold none of the passage neither comes on nor goes off", () => {
        const m = passage();
        m.addPerson(person("A-10", "passenger", 1, 1));
        m.addPerson(person("A-11", "passenger", 2, 1));
        m.addPerson(person("A-12", "passenger", 0, 0));
        expect(ids(changesAt(m, 0).on)).toEqual(["A-1", "A-2", "A-3", "A-7", "A-8"]);
        const second = changesAt(m, 1);
        expect(ids(second.on)).toEqual(["A-4", "A-5"]);
        expect(ids(second.off)).toEqual(["A-3"]);
        const third = changesAt(m, 2);
        expect(ids(third.on)).toEqual(["A-6"]);
        expect(ids(third.off)).toEqual(["A-5", "A-7"]);
    });

    it("follows the manifest as it changes", () => {
        const m = passage();
        m.removePerson("A-5");
        m.addPerson(person("A-9", "passenger", 1, 2));
        expect(ids(changesAt(m, 1).on)).toEqual(["A-4", "A-9"]);
        expect(ids(changesAt(m, 2).off)).toEqual(["A-7", "A-9"]);
    });

    it("does not change the manifest", () => {
        const m = passage();
        const before = [m.legList(), m.roster(), m.loadList(), m.amendments(), m.aboardOn(1), m.isSealed()];
        changesAt(m, 1);
        changesAt(m, 2);
        changesAt(m, 0);
        expect([m.legList(), m.roster(), m.loadList(), m.amendments(), m.aboardOn(1), m.isSealed()]).toEqual(before);
        expect(ids(changesAt(m, 1).on)).toEqual(["A-4", "A-5"]);
    });
});

unchanged(mod);
