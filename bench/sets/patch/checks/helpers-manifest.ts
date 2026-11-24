// What src/manifest.ts did before any task changed it. A task's check calls `unchanged` and skips, by name,
// only the cases its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/manifest");
type Leg = import("../src/manifest").Leg;
type Person = import("../src/manifest").Person;
type LoadItem = import("../src/manifest").LoadItem;
type Problem = import("../src/manifest").Problem;
type Manifest = import("../src/manifest").Manifest;

function leg(over: Partial<Leg> = {}): Leg {
    return {
        from: "Tolland Wharf",
        to: "Ashby Top Lock",
        day: 0,
        departMin: 540,
        distanceM: 6400,
        locks: 5,
        swingBridges: 0,
        ...over,
    };
}

function person(over: Partial<Person> = {}): Person {
    return {
        id: "P-01",
        surname: "Okafor",
        given: "Ruth",
        role: "skipper",
        age: 44,
        weightKg: 70,
        swimmer: true,
        boardLeg: 0,
        leaveLeg: -1,
        ...over,
    };
}

const TRIP_LEGS: Leg[] = [
    leg(),
    leg({ from: "Ashby Top Lock", to: "Merrow Junction", departMin: 780, distanceM: 9000, locks: 0, swingBridges: 2 }),
    leg({ from: "Merrow Junction", to: "Tolland Wharf", day: 1, departMin: 480, distanceM: 12000, locks: 3 }),
];

const TRIP_PEOPLE: Person[] = [
    person({ id: "P-03", surname: "Lindqvist", given: "Tom", role: "passenger", age: 9, weightKg: 0, swimmer: false }),
    person(),
    person({ id: "P-02", surname: "Brandt", given: "Ilse", role: "crew", age: 31, weightKg: 61.2 }),
    person({ id: "P-04", surname: "abbot", given: "Wen", role: "passenger", age: 67, weightKg: 0, boardLeg: 1, leaveLeg: 2 }),
    person({ id: "P-05", surname: "Lindqvist", given: "Ada", role: "passenger", age: 1, weightKg: 0, swimmer: false }),
    person({ id: "P-06", surname: "Achterberg", given: "Sam", role: "crew", age: 16, weightKg: 58, leaveLeg: 1 }),
];

const TRIP_LOAD: LoadItem[] = [
    { label: "gas bottle", unitKg: 13.5, count: 2, stowed: "aft" },
    { label: "bicycle", unitKg: 14, count: 2, stowed: "roof" },
    { label: "water cans", unitKg: 20, count: 3, stowed: "fore" },
];

const TRIP_SHEET = [
    "PASSAGE MANIFEST  Marsh Harrier (heron)",
    "Draft",
    "",
    "Legs",
    "  1  D1 09:00-11:20  Tolland Wharf > Ashby Top Lock  6.4 km, 5 locks  (2h 20m)",
    "  2  D1 13:00-15:05  Ashby Top Lock > Merrow Junction  9.0 km, 2 bridges  (2h 05m)",
    "  3  D2 08:00-11:10  Merrow Junction > Tolland Wharf  12.0 km, 3 locks  (3h 10m)",
    "",
    "People",
    "  P-01    OKAFOR, Ruth              skipper    70 kg   all legs",
    "  P-06    ACHTERBERG, Sam           crew       58 kg   leg 1",
    "  P-02    BRANDT, Ilse              crew       62 kg   all legs",
    "  P-04    ABBOT, Wen                passenger  82 kg   leg 2",
    "  P-05    LINDQVIST, Ada            passenger  12 kg   all legs  non-swimmer",
    "  P-03    LINDQVIST, Tom            passenger  35 kg   all legs  non-swimmer",
    "",
    "Load",
    "  2 x gas bottle (aft)  27 kg",
    "  2 x bicycle (roof)  28 kg",
    "  3 x water cans (fore)  60 kg",
    "",
    "Peak: 4 of 6 people, 376 of 780 kg",
];

const TROUBLE_PROBLEMS: Problem[] = [
    { code: "bad-legs", severity: "error", leg: -1, detail: "P-15" },
    { code: "skipper-age", severity: "error", leg: -1, detail: "P-10" },
    { code: "over-roof", severity: "error", leg: -1, detail: "45 kg of 40 kg" },
    { code: "leg-early", severity: "warning", leg: 0, detail: "departs 07:30" },
    { code: "no-crew", severity: "warning", leg: 0, detail: "5 locks" },
    { code: "leg-order", severity: "error", leg: 1, detail: "starts before leg 1 ends" },
    { code: "leg-gap", severity: "warning", leg: 1, detail: "Ashby Top Lock to Coldwater Basin" },
    { code: "leg-long", severity: "warning", leg: 1, detail: "6h 05m" },
    { code: "two-skippers", severity: "error", leg: 1, detail: "P-10, P-11" },
    { code: "over-people", severity: "error", leg: 1, detail: "6 of 4" },
    { code: "over-load", severity: "error", leg: 1, detail: "534 kg of 520 kg" },
    { code: "lifejackets", severity: "error", leg: 1, detail: "5 needed, 4 aboard" },
];

const TROUBLE_SHEET = [
    "PASSAGE MANIFEST  Dabchick (wren)",
    "Draft",
    "",
    "Legs",
    "  1  D1 07:30-09:50  Tolland Wharf > Ashby Top Lock  6.4 km, 5 locks  (2h 20m)",
    "  2  D1 09:40-15:45  Coldwater Basin > Merrow Junction  29.2 km  (6h 05m)",
    "",
    "People",
    "  P-10    VANE, Odile               skipper    60 kg   all legs",
    "  P-11    VANE, Piet                skipper    90 kg   leg 2",
    "  P-12    MARLOW, Cy                passenger  82 kg   all legs  non-swimmer",
    "  P-13    MARLOW, Dee               passenger  35 kg   all legs",
    "  P-14    MARLOW, Eli               passenger  35 kg   all legs  non-swimmer",
    "  P-15    QUIST, Bo                 passenger  100 kg  leg 2  non-swimmer",
    "  P-16    QUIST, Fay                passenger  12 kg   all legs  non-swimmer",
    "",
    "Load",
    "  1 x generator (roof)  45 kg",
    "  3 x coal (fore)  75 kg",
    "",
    "Peak: 6 of 4 people, 534 of 520 kg",
    "Day guests: £39.00",
    "",
    "Problems",
    "  !! all    bad-legs: P-15",
    "  !! all    skipper-age: P-10",
    "  !! all    over-roof: 45 kg of 40 kg",
    "   ! leg 1  leg-early: departs 07:30",
    "   ! leg 1  no-crew: 5 locks",
    "  !! leg 2  leg-order: starts before leg 1 ends",
    "   ! leg 2  leg-gap: Ashby Top Lock to Coldwater Basin",
    "   ! leg 2  leg-long: 6h 05m",
    "  !! leg 2  two-skippers: P-10, P-11",
    "  !! leg 2  over-people: 6 of 4",
    "  !! leg 2  over-load: 534 kg of 520 kg",
    "  !! leg 2  lifejackets: 5 needed, 4 aboard",
];

const EXPORT_TEXT = [
    "# Marsh Harrier, out Saturday",
    "L;Tolland Wharf;Ashby Top Lock;1;09:00;6.4;5",
    "",
    "l; Ashby Top Lock ; Merrow Junction ;1;13:00;9;;2",
    "L;Merrow Junction;Tolland Wharf;0;08:00;12;3",
    "P;p-01;Okafor;Ruth;skipper;44;70;y",
    "P;P-02;Brandt;Ilse;Crew;31;61.2;yes;1-2",
    "P;P-01;Okafor;Ruth;skipper;44;70;y",
    "P;P-03;Lindqvist;Tom;deckhand;9;;n",
    "X;what is this",
    "G;gas bottle;13.5;2;aft",
    "G;Gas  Bottle;13.5;;AFT",
    "G;anchor;18;1;locker",
    "  # a note, indented",
    "P;P-04;abbot;Wen;passenger;67;;n;2",
].join("\n");

const ids = (people: Person[]): string[] => people.map((p) => p.id);

/** Registers the cases that pin what the module does now, but for those named in `skip`. */
export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const add = (name: string, run: () => void): void => {
        if (cases.some(([known]) => known === name)) {
            throw new Error(`unchanged: two cases are named "${name}"`);
        }
        cases.push([name, run]);
    };

    const trip = (): Manifest => {
        const m = new mod.Manifest("  Marsh   Harrier ", " Heron");
        TRIP_LEGS.forEach((l) => m.addLeg(copyOf(l)));
        TRIP_PEOPLE.forEach((p) => m.addPerson(copyOf(p)));
        TRIP_LOAD.forEach((item) => m.addLoad(copyOf(item)));
        return m;
    };

    // A two-leg trip on the smallest boat with something wrong at every turn.
    const trouble = (): Manifest => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg({ departMin: 450 }));
        m.addLeg(leg({ from: "Coldwater Basin", to: "Merrow Junction", departMin: 580, distanceM: 29200, locks: 0 }));
        m.addPerson(person({ id: "P-10", surname: "Vane", given: "Odile", age: 17, weightKg: 60 }));
        m.addPerson(person({ id: "P-11", surname: "Vane", given: "Piet", age: 40, weightKg: 90, boardLeg: 1 }));
        const marlow = { surname: "Marlow", role: "passenger" as const, weightKg: 0 };
        m.addPerson(person({ ...marlow, id: "P-12", given: "Cy", age: 30, swimmer: false }));
        m.addPerson(person({ ...marlow, id: "P-13", given: "Dee", age: 8 }));
        m.addPerson(person({ ...marlow, id: "P-14", given: "Eli", age: 5, swimmer: false }));
        const quist = { surname: "Quist", role: "passenger" as const, swimmer: false };
        m.addPerson(person({ ...quist, id: "P-15", given: "Bo", age: 50, weightKg: 100, boardLeg: 1, leaveLeg: 5 }));
        m.addPerson(person({ ...quist, id: "P-16", given: "Fay", age: 1, weightKg: 0 }));
        m.addLoad({ label: "generator", unitKg: 45, count: 1, stowed: "roof" });
        m.addLoad({ label: "coal", unitKg: 25, count: 3, stowed: "fore" });
        return m;
    };

    // One leg on the smallest boat (2 berths, 4 people, 520 kg, 40 kg on the roof, 4 lifejackets), a skipper
    // and one grown crew aboard, and nothing wrong until a case adds to it.
    const small = (first: Partial<Leg> = {}): Manifest => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg(first));
        m.addPerson(person({ id: "S-1", weightKg: 80 }));
        m.addPerson(person({ id: "S-2", surname: "Brandt", given: "Ilse", role: "crew", age: 31, weightKg: 60 }));
        return m;
    };
    const codes = (m: Manifest): string[] => m.problems().map((p) => `${p.code}@${p.leg}`);
    const rider = (n: number, over: Partial<Person> = {}): Person =>
        person({ id: `R-${n}`, surname: "Marlow", given: `Rider${n}`, role: "passenger", age: 30, weightKg: 50, ...over });

    // ------------------------------------------------------------------------------------------- constants

    add("constants: the values that stand for none", () => {
        expect([mod.TO_END, mod.NO_LEG, mod.NO_TIME]).toEqual([-1, -1, -1]);
        expect(mod.DAY_MIN).toBe(1440);
        expect(mod.DAY_GUEST_PENCE).toBe(650);
    });
    add("constants: the boat classes and their limits", () => {
        expect(mod.BOAT_CLASSES).toEqual({
            wren: { cls: "wren", berths: 2, maxPeople: 4, maxLoadKg: 520, maxRoofKg: 40, lifejackets: 4 },
            heron: { cls: "heron", berths: 4, maxPeople: 6, maxLoadKg: 780, maxRoofKg: 60, lifejackets: 6 },
            kingfisher: { cls: "kingfisher", berths: 6, maxPeople: 8, maxLoadKg: 1040, maxRoofKg: 80, lifejackets: 8 },
            bittern: { cls: "bittern", berths: 8, maxPeople: 12, maxLoadKg: 1500, maxRoofKg: 110, lifejackets: 10 },
        });
    });

    // ---------------------------------------------------------------------------------------------- people

    add("ageBand: an infant is under two", () => {
        expect([0, 1, 2].map(mod.ageBand)).toEqual(["infant", "infant", "child"]);
    });
    add("ageBand: a child is under twelve", () => {
        expect([11, 12, 80].map(mod.ageBand)).toEqual(["child", "adult", "adult"]);
    });
    add("personWeightKg: a blank weight takes the standard for the age", () => {
        const blank = (age: number): number => mod.personWeightKg(person({ age, weightKg: 0 }));
        expect([0, 1, 2, 5, 11, 12, 44].map(blank)).toEqual([12, 12, 35, 35, 35, 82, 82]);
    });
    add("personWeightKg: a stated weight is rounded up to a whole kilo", () => {
        expect(mod.personWeightKg(person({ weightKg: 61.2 }))).toBe(62);
        expect(mod.personWeightKg(person({ weightKg: 70 }))).toBe(70);
        expect(mod.personWeightKg(person({ age: 9, weightKg: 28.5 }))).toBe(29);
    });
    add("personWeightKg: a weight below nought counts as blank", () => {
        expect(mod.personWeightKg(person({ weightKg: -5 }))).toBe(82);
    });
    add("isAboard: from the boarding leg up to, not on, the leaving leg", () => {
        const p = person({ boardLeg: 1, leaveLeg: 3 });
        expect([0, 1, 2, 3, 4].map((i) => mod.isAboard(p, i))).toEqual([false, true, true, false, false]);
    });
    add("isAboard: to the end of the passage", () => {
        const p = person({ boardLeg: 2, leaveLeg: mod.TO_END });
        expect([0, 1, 2, 3, 99].map((i) => mod.isAboard(p, i))).toEqual([false, false, true, true, true]);
    });
    add("isAboard: only -1 stands for the end of the passage", () => {
        const p = person({ boardLeg: 0, leaveLeg: -4 });
        expect([0, 1, 2].map((i) => mod.isAboard(p, i))).toEqual([false, false, false]);
    });
    add("isAboard: a span of one leg", () => {
        const p = person({ boardLeg: 0, leaveLeg: 1 });
        expect([0, 1].map((i) => mod.isAboard(p, i))).toEqual([true, false]);
    });
    add("headcount: infants are not counted", () => {
        const people = [44, 2, 1, 0, 12].map((age, n) => person({ id: `H-${n}`, age }));
        expect(mod.headcount(people)).toBe(3);
    });
    add("headcount: nobody", () => {
        expect(mod.headcount([])).toBe(0);
        expect(mod.headcount([person({ age: 1 })])).toBe(0);
        expect(mod.headcount([person({ age: 1.5 })])).toBe(0);
    });
    add("tidyPerson: works on the object it is given", () => {
        const raw = person({
            id: " p-07 ",
            surname: "  van   Hoorn ",
            given: " Mia  Lou",
            age: 30.9,
            weightKg: -3,
            boardLeg: 1.7,
            leaveLeg: -4,
        });
        const back = mod.tidyPerson(raw);
        expect(back).toBe(raw);
        expect(raw).toEqual(
            person({ id: "P-07", surname: "van Hoorn", given: "Mia Lou", age: 30, weightKg: 0, boardLeg: 1, leaveLeg: -1 }),
        );
    });
    add("tidyPerson: what it keeps and what it floors", () => {
        const raw = person({ age: -2, weightKg: 61.2, boardLeg: -1, leaveLeg: 2.9 });
        mod.tidyPerson(raw);
        expect(raw).toEqual(person({ age: 0, weightKg: 61.2, boardLeg: 0, leaveLeg: 2 }));
        expect(mod.tidyPerson(person({ leaveLeg: 0 })).leaveLeg).toBe(0);
    });
    add("comparePeople: skipper, then crew, then passengers", () => {
        const skipper = person({ surname: "Zell" });
        const crew = person({ surname: "Abel", role: "crew" });
        const passenger = person({ surname: "Aaron", role: "passenger" });
        expect(mod.comparePeople(skipper, crew)).toBeLessThan(0);
        expect(mod.comparePeople(passenger, crew)).toBeGreaterThan(0);
        expect(mod.comparePeople(passenger, skipper)).toBeGreaterThan(0);
    });
    add("comparePeople: by surname without regard to case, then given name, then id", () => {
        const list = [
            person({ id: "C-5", surname: "lindqvist", given: "Tom" }),
            person({ id: "C-4", surname: "Lindqvist", given: "ada" }),
            person({ id: "C-3", surname: "abbot", given: "Wen" }),
            person({ id: "C-2", surname: "Brandt", given: "Ilse" }),
            person({ id: "C-1", surname: "Lindqvist", given: "Tom" }),
        ];
        expect(ids(list.sort(mod.comparePeople))).toEqual(["C-3", "C-2", "C-4", "C-1", "C-5"]);
        expect(mod.comparePeople(person(), person())).toBe(0);
    });

    // ------------------------------------------------------------------------------------------- leg times

    add("legMinutes: cruising at 80 metres a minute and twelve minutes a lock", () => {
        expect(mod.legMinutes(leg())).toBe(140);
        expect(mod.legMinutes(leg({ distanceM: 12000, locks: 3 }))).toBe(190);
        expect(mod.legMinutes(leg({ distanceM: 0, locks: 0 }))).toBe(0);
    });
    add("legMinutes: four minutes a swing bridge", () => {
        expect(mod.legMinutes(leg({ distanceM: 800, locks: 0, swingBridges: 5 }))).toBe(30);
        expect(mod.legMinutes(leg({ distanceM: 9000, locks: 0, swingBridges: 2 }))).toBe(125);
    });
    add("legMinutes: rounded up to five minutes, never down", () => {
        expect(mod.legMinutes(leg({ distanceM: 4000, locks: 0 }))).toBe(50);
        expect(mod.legMinutes(leg({ distanceM: 4080, locks: 0 }))).toBe(55);
        expect(mod.legMinutes(leg({ distanceM: 1000, locks: 1 }))).toBe(25);
        expect(mod.legMinutes(leg({ distanceM: 800, locks: 0, swingBridges: 1 }))).toBe(15);
    });
    add("legMinutes: a flight of six locks or more is timed lock by lock like any other", () => {
        expect(mod.legMinutes(leg({ distanceM: 2400, locks: 6 }))).toBe(105);
        expect(mod.legMinutes(leg({ distanceM: 1600, locks: 9 }))).toBe(130);
    });
    add("legTimes: counted from the start of day 0", () => {
        expect(mod.legTimes(copyOf(TRIP_LEGS))).toEqual([
            { startMin: 540, endMin: 680 },
            { startMin: 780, endMin: 905 },
            { startMin: 1920, endMin: 2110 },
        ]);
    });
    add("legTimes: no legs, and a leg that runs past midnight", () => {
        expect(mod.legTimes([])).toEqual([]);
        expect(mod.legTimes([leg({ day: 2, departMin: 1380 })])).toEqual([{ startMin: 4260, endMin: 4400 }]);
    });
    add("parseClock: hours and minutes to minutes from midnight", () => {
        expect(["09:05", "9:05", " 23:59 ", "00:00"].map(mod.parseClock)).toEqual([545, 545, 1439, 0]);
    });
    add("parseClock: what is not a time", () => {
        expect(["24:00", "12:60", "noon", "12:5", "", "1200", "-1:30", "009:05"].map(mod.parseClock)).toEqual(
            [-1, -1, -1, -1, -1, -1, -1, -1],
        );
    });
    add("formatClock: two digits each, wrapped to the day", () => {
        expect([0, 545, 1439, 1440, 1520].map(mod.formatClock)).toEqual(["00:00", "09:05", "23:59", "00:00", "01:20"]);
    });
    add("formatClock: no time", () => {
        expect(mod.formatClock(mod.NO_TIME)).toBe("--:--");
    });
    add("formatStamp: the first day is D1", () => {
        expect([540, 1439, 1440, 1920, 2885].map(mod.formatStamp)).toEqual(
            ["D1 09:00", "D1 23:59", "D2 00:00", "D2 08:00", "D3 00:05"],
        );
    });
    add("formatStamp: no time", () => {
        expect(mod.formatStamp(-1)).toBe("-- --:--");
    });
    add("formatDuration: hours and minutes", () => {
        expect([65, 140, 365, 605].map(mod.formatDuration)).toEqual(["1h 05m", "2h 20m", "6h 05m", "10h 05m"]);
    });
    add("formatDuration: under an hour, and whole hours", () => {
        expect([0, 5, 45, 60, 180].map(mod.formatDuration)).toEqual(["0m", "5m", "45m", "1h", "3h"]);
    });
    add("formatDistance: metres under a kilometre", () => {
        expect([0, 850, 999].map(mod.formatDistance)).toEqual(["0 m", "850 m", "999 m"]);
        // to the nearest metre
        expect([850.4, 850.6].map(mod.formatDistance)).toEqual(["850 m", "851 m"]);
    });
    add("formatDistance: kilometres to one place", () => {
        expect([1000, 1249, 1250, 6400, 9960, 12000, 29200].map(mod.formatDistance)).toEqual(
            ["1.0 km", "1.2 km", "1.3 km", "6.4 km", "10.0 km", "12.0 km", "29.2 km"],
        );
    });
    add("formatPence: pounds and two places", () => {
        expect([0, 5, 650, 1300, 123456].map(mod.formatPence)).toEqual(["£0.00", "£0.05", "£6.50", "£13.00", "£1234.56"]);
    });
    add("formatPence: a part of a penny goes to the nearest penny", () => {
        expect([649.4, 649.6].map(mod.formatPence)).toEqual(["£6.49", "£6.50"]);
    });
    add("formatPence: money owed back", () => {
        expect(mod.formatPence(-650)).toBe("-£6.50");
        expect(mod.formatPence(-5)).toBe("-£0.05");
    });

    // ------------------------------------------------------------------------------------------------ gear

    add("gearKg: everything, or what is stowed in one place", () => {
        const load = copyOf(TRIP_LOAD);
        expect(mod.gearKg(load)).toBe(115);
        expect(mod.gearKg(load, "roof")).toBe(28);
        expect(mod.gearKg(load, "aft")).toBe(27);
        expect(mod.gearKg(load, "cabin")).toBe(0);
        expect(load).toEqual(TRIP_LOAD);
    });
    add("gearKg: the total is rounded up to a whole kilo", () => {
        expect(mod.gearKg([{ label: "kedge", unitKg: 12.25, count: 1, stowed: "fore" }])).toBe(13);
        expect(mod.gearKg([{ label: "fender", unitKg: 0.5, count: 3, stowed: "aft" }])).toBe(2);
        // the parts are not rounded one by one
        const two: LoadItem[] = [
            { label: "kedge", unitKg: 12.25, count: 1, stowed: "fore" },
            { label: "warp", unitKg: 3.25, count: 1, stowed: "fore" },
        ];
        expect(mod.gearKg(two)).toBe(16);
        expect(mod.gearKg([])).toBe(0);
    });
    add("legSpan: the whole passage", () => {
        expect(mod.legSpan(person(), 3)).toBe("all legs");
        expect(mod.legSpan(person({ leaveLeg: 3 }), 3)).toBe("all legs");
        expect(mod.legSpan(person({ leaveLeg: 5 }), 3)).toBe("all legs");
        expect(mod.legSpan(person(), 1)).toBe("all legs");
    });
    add("legSpan: legs counted from 1, the last one aboard given", () => {
        expect(mod.legSpan(person({ boardLeg: 1, leaveLeg: 2 }), 3)).toBe("leg 2");
        expect(mod.legSpan(person({ boardLeg: 1, leaveLeg: 3 }), 3)).toBe("legs 2-3");
        expect(mod.legSpan(person({ boardLeg: 0, leaveLeg: 2 }), 3)).toBe("legs 1-2");
        expect(mod.legSpan(person({ boardLeg: 2 }), 3)).toBe("leg 3");
        expect(mod.legSpan(person({ boardLeg: 1 }), 4)).toBe("legs 2-4");
        expect(mod.legSpan(person({ boardLeg: 0, leaveLeg: 1 }), 3)).toBe("leg 1");
    });
    add("legSpan: a span that holds no leg", () => {
        expect(mod.legSpan(person({ boardLeg: 3 }), 3)).toBe("no legs");
        expect(mod.legSpan(person({ boardLeg: 1, leaveLeg: 1 }), 3)).toBe("no legs");
        expect(mod.legSpan(person(), 0)).toBe("no legs");
        // only -1 stands for the end
        expect(mod.legSpan(person({ boardLeg: 1, leaveLeg: -4 }), 3)).toBe("no legs");
    });

    // --------------------------------------------------------------------------------------------- parsing

    add("parseLegLine: a full row", () => {
        expect(mod.parseLegLine("Tolland  Wharf; Ashby Top Lock ;1;09:00;6.4;5;0")).toEqual(leg());
    });
    add("parseLegLine: the day counts from 1 and the distance is in kilometres", () => {
        expect(mod.parseLegLine("A;B;2;8:15;0.85")).toEqual(
            { from: "A", to: "B", day: 1, departMin: 495, distanceM: 850, locks: 0, swingBridges: 0 },
        );
        expect(mod.parseLegLine("A;B;1;10:00;3;;2")).toEqual(
            { from: "A", to: "B", day: 0, departMin: 600, distanceM: 3000, locks: 0, swingBridges: 2 },
        );
        // to the nearest metre
        expect(mod.parseLegLine("A;B;1;10:00;2.01")?.distanceM).toBe(2010);
    });
    add("parseLegLine: rows it will not read", () => {
        const bad = [
            "A;B;0;09:00;6.4",
            "A;B;1;25:00;6.4",
            "A;B;1;09:00;",
            "A;B;1;09:00",
            "A;B;1;09:00;-1",
            "A;B;1;09:00;far",
            "A;B;1;09:00;6.4;x",
            "A;B;1;09:00;6.4;2;-1",
            ";B;1;09:00;6.4",
            "A;;1;09:00;6.4",
            "A;B;one;09:00;6.4",
        ];
        expect(bad.map(mod.parseLegLine)).toEqual(bad.map(() => null));
    });
    add("parsePersonLine: a row with no weight and no legs", () => {
        expect(mod.parsePersonLine("p-03; Lindqvist ;Tom;Passenger;9;;n")).toEqual(
            person({ id: "P-03", surname: "Lindqvist", given: "Tom", role: "passenger", age: 9, weightKg: 0, swimmer: false }),
        );
    });
    add("parsePersonLine: the legs count from 1 and name the last leg aboard", () => {
        const span = (legs: string): number[] => {
            const p = mod.parsePersonLine(`P-04;abbot;Wen;passenger;67;61.2;yes;${legs}`);
            return p === null ? [] : [p.boardLeg, p.leaveLeg, p.weightKg];
        };
        expect(span("2")).toEqual([1, 2, 61.2]);
        expect(span("2-3")).toEqual([1, 3, 61.2]);
        expect(span("2 - 3")).toEqual([1, 3, 61.2]);
        expect(span("2-")).toEqual([1, -1, 61.2]);
        expect(span("1-1")).toEqual([0, 1, 61.2]);
        expect(span("")).toEqual([0, -1, 61.2]);
    });
    add("parsePersonLine: who swims", () => {
        const swims = (word: string): boolean | undefined =>
            mod.parsePersonLine(`P-04;abbot;Wen;passenger;67;;${word}`)?.swimmer;
        expect(["y", "Y", "yes", "YES", "n", "no", "true", ""].map(swims)).toEqual(
            [true, true, true, true, false, false, false, false],
        );
    });
    add("parsePersonLine: rows it will not read", () => {
        const bad = [
            "P-04;abbot;Wen;passenger;67;;y;3-2",
            "P-04;abbot;Wen;passenger;67;;y;0",
            "P-04;abbot;Wen;passenger;67;;y;two",
            "P-04;abbot;Wen;captain;67;;y",
            "P-04;abbot;Wen;passenger;old;;y",
            "P-04;abbot;Wen;passenger;;;y",
            "P-04;abbot;Wen;passenger;67;heavy;y",
            "P-04;abbot;Wen;passenger;67;-4;y",
            "P-04;abbot;Wen;passenger;67;",
            ";abbot;Wen;passenger;67;;y",
            "P-04;;Wen;passenger;67;;y",
        ];
        expect(bad.map(mod.parsePersonLine)).toEqual(bad.map(() => null));
    });
    add("parseLoadLine: a row, and a blank count for one", () => {
        expect(mod.parseLoadLine("gas  bottle;13.5;2;aft")).toEqual(
            { label: "gas bottle", unitKg: 13.5, count: 2, stowed: "aft" },
        );
        expect(mod.parseLoadLine(" bicycle ;14;;Roof")).toEqual({ label: "bicycle", unitKg: 14, count: 1, stowed: "roof" });
    });
    add("parseLoadLine: rows it will not read", () => {
        const bad = ["anchor;18;1;locker", "anchor;18;0;fore", "anchor;;1;fore", "anchor;18;1", "anchor;-1;1;fore",
            ";18;1;fore", "anchor;18;1.5;fore", "anchor;heavy;1;fore"];
        expect(bad.map(mod.parseLoadLine)).toEqual(bad.map(() => null));
    });

    // ------------------------------------------------------------------------------------------- checkLegs

    add("checkLegs: a leg may leave at eight and not before", () => {
        expect(mod.checkLegs([leg({ departMin: 480 })])).toEqual([]);
        expect(mod.checkLegs([leg({ departMin: 479 })])).toEqual(
            [{ code: "leg-early", severity: "warning", leg: 0, detail: "departs 07:59" }],
        );
    });
    add("checkLegs: a leg may arrive at half past seven in the evening and not after", () => {
        expect(mod.checkLegs([leg({ departMin: 1030 })])).toEqual([]);
        expect(mod.checkLegs([leg({ departMin: 1035 })])).toEqual(
            [{ code: "leg-late", severity: "error", leg: 0, detail: "arrives 19:35" }],
        );
    });
    add("checkLegs: a leg that runs past midnight is late", () => {
        expect(mod.checkLegs([leg({ departMin: 1380 })])).toEqual(
            [{ code: "leg-late", severity: "error", leg: 0, detail: "arrives 01:20" }],
        );
    });
    add("checkLegs: a leg may take six hours and no longer", () => {
        expect(mod.checkLegs([leg({ distanceM: 28800, locks: 0 })])).toEqual([]);
        expect(mod.checkLegs([leg({ distanceM: 29200, locks: 0 })])).toEqual(
            [{ code: "leg-long", severity: "warning", leg: 0, detail: "6h 05m" }],
        );
    });
    add("checkLegs: a leg may start the minute the last one ends and not before", () => {
        const next = { from: "Ashby Top Lock", to: "Merrow Junction" };
        expect(mod.checkLegs([leg(), leg({ ...next, departMin: 680 })])).toEqual([]);
        expect(mod.checkLegs([leg(), leg({ ...next, departMin: 675 })])).toEqual(
            [{ code: "leg-order", severity: "error", leg: 1, detail: "starts before leg 1 ends" }],
        );
        // the day counts: the same clock time a day later is in order
        expect(mod.checkLegs([leg(), leg({ ...next, day: 1, departMin: 540 })])).toEqual([]);
        expect(mod.checkLegs([leg({ day: 1 }), leg({ ...next, day: 0, departMin: 900 })])).toEqual(
            [{ code: "leg-order", severity: "error", leg: 1, detail: "starts before leg 1 ends" }],
        );
    });
    add("checkLegs: each leg starts where the last ended, whatever the case of the name", () => {
        expect(mod.checkLegs([leg(), leg({ from: "ASHBY top lock", to: "Merrow Junction", departMin: 780 })])).toEqual([]);
        expect(mod.checkLegs([leg(), leg({ from: "Coldwater Basin", to: "Merrow Junction", departMin: 780 })])).toEqual(
            [{ code: "leg-gap", severity: "warning", leg: 1, detail: "Ashby Top Lock to Coldwater Basin" }],
        );
    });
    add("checkLegs: by leg, and within a leg in the fixed order", () => {
        const legs = [
            leg({ departMin: 450, distanceM: 29200, locks: 0 }),
            leg({ from: "Coldwater Basin", to: "Merrow Junction", departMin: 470, distanceM: 29200, locks: 0 }),
            leg({ from: "Merrow Junction", to: "Tolland Wharf", day: 1, departMin: 1100 }),
        ];
        const before = copyOf(legs);
        expect(mod.checkLegs(legs).map((p) => `${p.code}@${p.leg}`)).toEqual([
            "leg-early@0",
            "leg-long@0",
            "leg-order@1",
            "leg-gap@1",
            "leg-early@1",
            "leg-long@1",
            "leg-late@2",
        ]);
        expect(legs).toEqual(before);
        expect(mod.checkLegs([])).toEqual([]);
    });

    // -------------------------------------------------------------------------------------------- Manifest

    add("Manifest: the boat's name is tidied and its class found whatever the case", () => {
        const m = trip();
        expect(m.boatName).toBe("Marsh Harrier");
        expect(m.limits).toEqual({ cls: "heron", berths: 4, maxPeople: 6, maxLoadKg: 780, maxRoofKg: 60, lifejackets: 6 });
    });
    add("Manifest: a class the yard does not have", () => {
        expect(() => new mod.Manifest("Dabchick", "punt")).toThrow("unknown boat class: punt");
    });
    add("Manifest: its limits are its own copy of the table's", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        expect(m.limits).not.toBe(mod.BOAT_CLASSES.wren);
        expect(m.limits).toEqual(mod.BOAT_CLASSES.wren);
    });
    add("Manifest.legCount: none, then as many as were added", () => {
        expect(new mod.Manifest("Dabchick", "wren").legCount).toBe(0);
        expect(trip().legCount).toBe(3);
    });
    add("Manifest.addLeg: gives the new leg's index and tidies the place names", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        const given = leg({ from: "  Tolland   Wharf", to: "Ashby Top Lock  " });
        const before = copyOf(given);
        expect(m.addLeg(given)).toBe(0);
        expect(m.addLeg(leg({ day: 1 }))).toBe(1);
        expect(given).toEqual(before);
        expect(m.legList()).toEqual([leg(), leg({ day: 1 })]);
    });
    add("Manifest.addLeg: a negative measure is thrown out", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        expect(() => m.addLeg(leg({ distanceM: -1 }))).toThrow(RangeError);
        expect(() => m.addLeg(leg({ locks: -1 }))).toThrow("a leg cannot have a negative measure");
        expect(() => m.addLeg(leg({ swingBridges: -2 }))).toThrow(RangeError);
        expect(m.legCount).toBe(0);
    });
    add("Manifest.legList: copies, in the order added", () => {
        const m = trip();
        const list = m.legList();
        expect(list).toEqual(TRIP_LEGS);
        list[0].locks = 99;
        list.pop();
        expect(m.legList()).toEqual(TRIP_LEGS);
    });
    add("Manifest.addPerson: keeps a tidied copy and leaves the caller's object alone", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg());
        const given = person({ id: " p-07 ", surname: "van   Hoorn", age: 30.9, leaveLeg: -7 });
        const before = copyOf(given);
        expect(m.addPerson(given)).toBe(true);
        expect(given).toEqual(before);
        expect(m.roster()).toEqual([person({ id: "P-07", surname: "van Hoorn", age: 30, leaveLeg: -1 })]);
    });
    add("Manifest.addPerson: an id already aboard, or no id, is refused", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        expect(m.addPerson(person({ id: "P-07" }))).toBe(true);
        expect(m.addPerson(person({ id: " p-07", surname: "Other" }))).toBe(false);
        expect(m.addPerson(person({ id: "   " }))).toBe(false);
        expect(m.roster().map((p) => p.surname)).toEqual(["Okafor"]);
    });
    add("Manifest.removePerson: by id, whatever its case", () => {
        const m = trip();
        expect(m.removePerson(" p-04 ")).toBe(true);
        expect(ids(m.aboardOn(1))).toEqual(["P-03", "P-01", "P-02", "P-05"]);
    });
    add("Manifest.removePerson: an id that is not there", () => {
        const m = trip();
        expect(m.removePerson("P-99")).toBe(false);
        expect(m.roster()).toHaveLength(6);
    });
    add("Manifest.addLoad: the same thing in the same place is one row, whatever the case of its label", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        const given: LoadItem = { label: " gas   bottle", unitKg: 13.5, count: 2, stowed: "aft" };
        const before = copyOf(given);
        expect(m.addLoad(given)).toBe(true);
        expect(m.addLoad({ label: "Gas Bottle", unitKg: 13.5, count: 1, stowed: "aft" })).toBe(true);
        expect(m.addLoad({ label: "gas bottle", unitKg: 13.5, count: 1, stowed: "fore" })).toBe(true);
        expect(m.addLoad({ label: "gas bottles", unitKg: 13.5, count: 4, stowed: "aft" })).toBe(true);
        expect(given).toEqual(before);
        given.count = 70;
        expect(m.loadList()).toEqual([
            { label: "gas bottle", unitKg: 13.5, count: 3, stowed: "aft" },
            { label: "gas bottle", unitKg: 13.5, count: 1, stowed: "fore" },
            { label: "gas bottles", unitKg: 13.5, count: 4, stowed: "aft" },
        ]);
    });
    add("Manifest.addLoad: when the unit weights differ it is still one row, at the first unit weight", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg());
        expect(m.addLoad({ label: "gas bottle", unitKg: 13.5, count: 2, stowed: "aft" })).toBe(true);
        expect(m.addLoad({ label: "Gas Bottle", unitKg: 15, count: 1, stowed: "aft" })).toBe(true);
        expect(m.loadList()).toEqual([{ label: "gas bottle", unitKg: 13.5, count: 3, stowed: "aft" }]);
        expect(m.loadOn(0).gearKg).toBe(41);
    });
    add("Manifest.addLoad: a count of none or a weight below nought is refused", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        expect(m.addLoad({ label: "coal", unitKg: 25, count: 0, stowed: "fore" })).toBe(false);
        expect(m.addLoad({ label: "coal", unitKg: -1, count: 2, stowed: "fore" })).toBe(false);
        expect(m.addLoad({ label: "tiller pin", unitKg: 0, count: 1, stowed: "aft" })).toBe(true);
        expect(m.loadList()).toEqual([{ label: "tiller pin", unitKg: 0, count: 1, stowed: "aft" }]);
    });
    add("Manifest.addLoad: a part of one is taken, and a count or a weight that is not a number is refused", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        expect(m.addLoad({ label: "coal", unitKg: 25, count: Number.NaN, stowed: "fore" })).toBe(false);
        expect(m.addLoad({ label: "coal", unitKg: Number.NaN, count: 1, stowed: "fore" })).toBe(false);
        expect(m.addLoad({ label: "diesel", unitKg: 20, count: 0.5, stowed: "aft" })).toBe(true);
        expect(m.loadList()).toEqual([{ label: "diesel", unitKg: 20, count: 0.5, stowed: "aft" }]);
    });
    add("Manifest.loadList: copies, in the order added", () => {
        const m = trip();
        const list = m.loadList();
        expect(list).toEqual(TRIP_LOAD);
        list[0].count = 50;
        expect(m.loadList()).toEqual(TRIP_LOAD);
    });
    add("Manifest.roster: skipper, crew, passengers, each by name", () => {
        expect(ids(trip().roster())).toEqual(["P-01", "P-06", "P-02", "P-04", "P-05", "P-03"]);
    });
    add("Manifest.roster: copies", () => {
        const m = trip();
        m.roster()[0].surname = "Changed";
        expect(m.roster()[0]).toEqual(person());
    });
    add("Manifest.aboardOn: who is aboard for each leg, in the order they were added", () => {
        const m = trip();
        expect(ids(m.aboardOn(0))).toEqual(["P-03", "P-01", "P-02", "P-05", "P-06"]);
        expect(ids(m.aboardOn(1))).toEqual(["P-03", "P-01", "P-02", "P-04", "P-05"]);
        expect(ids(m.aboardOn(2))).toEqual(["P-03", "P-01", "P-02", "P-05"]);
    });
    add("Manifest.aboardOn: nobody for a leg the manifest does not have, and copies for one it has", () => {
        const m = trip();
        expect(m.aboardOn(3)).toEqual([]);
        expect(m.aboardOn(-1)).toEqual([]);
        m.aboardOn(0)[1].role = "passenger";
        expect(m.aboardOn(0)[1]).toEqual(person());
    });
    add("Manifest.headcountOn: infants are not counted", () => {
        const m = trip();
        expect([0, 1, 2].map((i) => m.headcountOn(i))).toEqual([4, 4, 3]);
    });
    add("Manifest.headcountOn: a leg the manifest does not have", () => {
        expect(trip().headcountOn(7)).toBe(0);
    });
    add("Manifest.loadOn: people aboard for the leg and all the gear", () => {
        const m = trip();
        expect(m.loadOn(0)).toEqual({ peopleKg: 237, gearKg: 115, roofKg: 28, totalKg: 352 });
        expect(m.loadOn(1)).toEqual({ peopleKg: 261, gearKg: 115, roofKg: 28, totalKg: 376 });
        expect(m.loadOn(2)).toEqual({ peopleKg: 179, gearKg: 115, roofKg: 28, totalKg: 294 });
    });
    add("Manifest.loadOn: a leg the manifest does not have carries the gear alone", () => {
        expect(trip().loadOn(9)).toEqual({ peopleKg: 0, gearKg: 115, roofKg: 28, totalKg: 115 });
    });

    // ------------------------------------------------------------------------------------ Manifest.problems

    add("Manifest.problems: a sound manifest has none", () => {
        expect(trip().problems()).toEqual([]);
        expect(small().problems()).toEqual([]);
    });
    add("Manifest.problems: whole-manifest problems first, then by leg, each in the fixed order", () => {
        expect(trouble().problems()).toEqual(TROUBLE_PROBLEMS);
    });
    add("Manifest.problems: no legs", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        expect(m.problems()).toEqual([{ code: "no-legs", severity: "error", leg: -1, detail: "" }]);
        m.addPerson(person({ id: "S-1" }));
        expect(codes(m)).toEqual(["no-legs@-1", "bad-legs@-1"]);
    });
    add("Manifest.problems: a person's legs must lie inside the passage", () => {
        const m = small();
        m.addLeg(leg({ from: "Ashby Top Lock", to: "Merrow Junction", departMin: 780, locks: 0 }));
        m.addPerson(rider(1, { boardLeg: 1, leaveLeg: 2 }));
        m.addPerson(rider(2, { boardLeg: 0, leaveLeg: 1 }));
        expect(m.problems()).toEqual([]);
        m.addPerson(rider(3, { boardLeg: 2 }));
        m.addPerson(rider(4, { boardLeg: 1, leaveLeg: 3 }));
        m.addPerson(rider(5, { boardLeg: 1, leaveLeg: 1 }));
        m.addPerson(rider(6, { boardLeg: 1, leaveLeg: 0 }));
        expect(m.problems().filter((p) => p.code === "bad-legs")).toEqual(
            ["R-3", "R-4", "R-5", "R-6"].map((detail) => ({ code: "bad-legs", severity: "error", leg: -1, detail })),
        );
    });
    add("Manifest.problems: problems of one code on one leg are in the order of their detail", () => {
        const m = small();
        m.addPerson(rider(15, { boardLeg: 4 }));
        m.addPerson(rider(12, { boardLeg: 2 }));
        m.addPerson(rider(13, { boardLeg: 3 }));
        expect(m.problems()).toEqual(
            ["R-12", "R-13", "R-15"].map((detail) => ({ code: "bad-legs", severity: "error", leg: -1, detail })),
        );
    });
    add("Manifest.problems: a skipper must be eighteen", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg({ locks: 0 }));
        m.addPerson(person({ id: "S-1", age: 18 }));
        expect(m.problems()).toEqual([]);
        const young = new mod.Manifest("Dabchick", "wren");
        young.addLeg(leg({ locks: 0 }));
        young.addPerson(person({ id: "S-1", age: 17 }));
        expect(young.problems()).toEqual([{ code: "skipper-age", severity: "error", leg: -1, detail: "S-1" }]);
    });
    add("Manifest.problems: the roof may carry its limit and no more", () => {
        const m = small();
        m.addLoad({ label: "bicycle", unitKg: 20, count: 2, stowed: "roof" });
        m.addLoad({ label: "coal", unitKg: 25, count: 4, stowed: "fore" });
        expect(m.problems()).toEqual([]);
        m.addLoad({ label: "pole", unitKg: 0.5, count: 1, stowed: "roof" });
        expect(m.problems()).toEqual([{ code: "over-roof", severity: "error", leg: -1, detail: "41 kg of 40 kg" }]);
    });
    add("Manifest.problems: each leg needs one skipper", () => {
        const m = small();
        m.addLeg(leg({ from: "Ashby Top Lock", to: "Merrow Junction", departMin: 780, locks: 0 }));
        m.removePerson("S-1");
        m.addPerson(person({ id: "S-3", boardLeg: 1 }));
        expect(m.problems()).toEqual([{ code: "no-skipper", severity: "error", leg: 0, detail: "" }]);
        m.addPerson(person({ id: "S-0", surname: "Abel" }));
        expect(m.problems()).toEqual([{ code: "two-skippers", severity: "error", leg: 1, detail: "S-3, S-0" }]);
    });
    add("Manifest.problems: a leg with locks needs a grown crew member besides the skipper", () => {
        const m = small();
        m.removePerson("S-2");
        expect(m.problems()).toEqual([{ code: "no-crew", severity: "warning", leg: 0, detail: "5 locks" }]);
        m.addPerson(rider(1));
        m.addPerson(person({ id: "S-4", role: "crew", age: 11 }));
        expect(codes(m)).toEqual(["no-crew@0"]);
        m.addPerson(person({ id: "S-5", role: "crew", age: 12 }));
        expect(m.problems()).toEqual([]);
    });
    add("Manifest.problems: everything that can be wrong with one leg, in the fixed order", () => {
        const m = new mod.Manifest("Dabchick", "wren");
        m.addLeg(leg({ departMin: 420, distanceM: 60800, locks: 2 }));
        for (let n = 1; n <= 5; n++) {
            m.addPerson(rider(n, { weightKg: 110, swimmer: false }));
        }
        expect(m.problems()).toEqual([
            { code: "leg-early", severity: "warning", leg: 0, detail: "departs 07:00" },
            { code: "leg-late", severity: "error", leg: 0, detail: "arrives 20:05" },
            { code: "leg-long", severity: "warning", leg: 0, detail: "13h 05m" },
            { code: "no-skipper", severity: "error", leg: 0, detail: "" },
            { code: "no-crew", severity: "warning", leg: 0, detail: "2 locks" },
            { code: "over-people", severity: "error", leg: 0, detail: "5 of 4" },
            { code: "over-load", severity: "error", leg: 0, detail: "550 kg of 520 kg" },
            { code: "lifejackets", severity: "error", leg: 0, detail: "5 needed, 4 aboard" },
        ]);
    });
    add("Manifest.problems: two skippers and nobody to work the locks", () => {
        const m = small();
        m.removePerson("S-2");
        m.addPerson(person({ id: "S-9", surname: "Abel" }));
        expect(codes(m)).toEqual(["two-skippers@0", "no-crew@0"]);
    });
    add("Manifest.problems: a leg with no locks needs no crew", () => {
        const m = small({ locks: 0, swingBridges: 3 });
        m.removePerson("S-2");
        expect(m.problems()).toEqual([]);
    });
    add("Manifest.problems: the boat may carry its limit of people, infants aside", () => {
        const m = small();
        m.addPerson(rider(1));
        m.addPerson(rider(2));
        m.addPerson(rider(3, { age: 1, weightKg: 0, swimmer: false }));
        expect(m.problems()).toEqual([]);
        m.addPerson(rider(4, { age: 2, weightKg: 0 }));
        expect(m.problems()).toEqual([{ code: "over-people", severity: "error", leg: 0, detail: "5 of 4" }]);
    });
    add("Manifest.problems: people and gear together may weigh the limit and no more", () => {
        const m = small();
        m.addPerson(rider(1, { weightKg: 110 }));
        m.addPerson(rider(2, { weightKg: 119.5 }));
        m.addLoad({ label: "coal", unitKg: 25, count: 6, stowed: "fore" });
        expect(m.loadOn(0).totalKg).toBe(520);
        expect(m.problems()).toEqual([]);
        m.addLoad({ label: "windlass", unitKg: 1, count: 1, stowed: "aft" });
        expect(m.problems()).toEqual([{ code: "over-load", severity: "error", leg: 0, detail: "521 kg of 520 kg" }]);
    });
    add("Manifest.problems: a lifejacket for every non-swimmer and everyone under twelve", () => {
        const m = new mod.Manifest("Marsh Harrier", "heron");
        m.addLeg(leg());
        m.addPerson(person({ id: "S-1" }));
        m.addPerson(person({ id: "S-2", role: "crew", age: 30 }));
        m.addPerson(rider(1, { swimmer: false }));
        m.addPerson(rider(2, { age: 11 }));
        m.addPerson(rider(3, { age: 2, swimmer: false }));
        for (let n = 4; n <= 6; n++) {
            m.addPerson(rider(n, { age: 1, weightKg: 0 }));
        }
        // twelve is grown: a swimmer of twelve needs none
        m.addPerson(rider(8, { age: 12 }));
        expect(m.problems()).toEqual([]);
        m.addPerson(rider(7, { age: 0, weightKg: 0 }));
        expect(m.problems()).toEqual([{ code: "lifejackets", severity: "error", leg: 0, detail: "7 needed, 6 aboard" }]);
    });

    // ---------------------------------------------------------------------------------- amendments, sealing

    add("Manifest.amend: tidies who and what, and refuses a blank of either", () => {
        const m = trip();
        expect(m.amend("  R.  Okafor ", " swapped   the gas bottle ")).toBe(true);
        expect(m.amend("", "something")).toBe(false);
        expect(m.amend("R. Okafor", "   ")).toBe(false);
        expect(m.amendments()).toEqual([{ by: "R. Okafor", text: "swapped the gas bottle" }]);
    });
    add("Manifest.amendments: newest first", () => {
        const m = trip();
        m.amend("R. Okafor", "first note");
        m.amend("I. Brandt", "second note");
        m.amend("R. Okafor", "third note");
        expect(m.amendments().map((a) => a.text)).toEqual(["third note", "second note", "first note"]);
        expect(m.amendments()[0]).toEqual({ by: "R. Okafor", text: "third note" });
        expect(m.amendments()[1]).toEqual({ by: "I. Brandt", text: "second note" });
    });
    add("Manifest.amendments: none at first, and copies after", () => {
        const m = trip();
        expect(m.amendments()).toEqual([]);
        m.amend("R. Okafor", "first note");
        m.amend("I. Brandt", "second note");
        const list = m.amendments();
        list[0].text = "changed";
        list.reverse();
        list.pop();
        expect(m.amendments()).toEqual([
            { by: "I. Brandt", text: "second note" },
            { by: "R. Okafor", text: "first note" },
        ]);
    });
    add("Manifest.seal: a sound manifest is sealed in the checker's name, and the sealing is noted", () => {
        const m = trip();
        expect(m.isSealed()).toBe(false);
        expect(m.sealedBy()).toBe("");
        m.amend("I. Brandt", "weights checked");
        expect(m.seal("  R.  Okafor ")).toBe(true);
        expect(m.isSealed()).toBe(true);
        expect(m.sealedBy()).toBe("R. Okafor");
        expect(m.amendments()).toEqual([
            { by: "R. Okafor", text: "sealed" },
            { by: "I. Brandt", text: "weights checked" },
        ]);
    });
    add("Manifest.seal: refused with no name, when sealed already, and while an error stands", () => {
        const m = trip();
        expect(m.seal("   ")).toBe(false);
        expect(m.seal("R. Okafor")).toBe(true);
        expect(m.seal("I. Brandt")).toBe(false);
        expect(m.sealedBy()).toBe("R. Okafor");
        const bad = trouble();
        expect(bad.seal("R. Okafor")).toBe(false);
        expect(bad.isSealed()).toBe(false);
        expect(bad.amendments()).toEqual([]);
    });
    add("Manifest.seal: warnings do not stop it", () => {
        const m = small({ departMin: 450 });
        m.removePerson("S-2");
        expect(codes(m)).toEqual(["leg-early@0", "no-crew@0"]);
        expect(m.seal("R. Okafor")).toBe(true);
    });
    add("Manifest: a sealed manifest cannot be changed, only amended", () => {
        const m = trip();
        m.seal("R. Okafor");
        expect(() => m.addLeg(leg({ day: 2 }))).toThrow("manifest is sealed");
        expect(() => m.addPerson(rider(1))).toThrow("manifest is sealed");
        expect(() => m.removePerson("P-04")).toThrow("manifest is sealed");
        expect(() => m.addLoad({ label: "coal", unitKg: 25, count: 1, stowed: "fore" })).toThrow("manifest is sealed");
        expect(m.amend("I. Brandt", "gas bottle swapped")).toBe(true);
        expect(m.legCount).toBe(3);
        expect(m.roster()).toHaveLength(6);
        expect(m.loadList()).toEqual(TRIP_LOAD);
        expect(m.amendments().map((a) => a.text)).toEqual(["gas bottle swapped", "sealed"]);
    });
    add("Manifest: a sealed manifest throws before it looks at what it is given", () => {
        const m = trip();
        m.seal("R. Okafor");
        expect(() => m.addPerson(person())).toThrow("manifest is sealed");
        expect(() => m.addPerson(person({ id: "   " }))).toThrow("manifest is sealed");
        expect(() => m.removePerson("P-99")).toThrow("manifest is sealed");
        expect(() => m.addLeg(leg({ distanceM: -1 }))).toThrow("manifest is sealed");
        expect(() => m.addLoad({ label: "coal", unitKg: 25, count: 0, stowed: "fore" })).toThrow("manifest is sealed");
        expect(m.legCount).toBe(3);
        expect(m.roster()).toHaveLength(6);
        expect(m.loadList()).toEqual(TRIP_LOAD);
    });
    add("Manifest.reopen: back to a draft, with the reason noted", () => {
        const m = trip();
        m.seal("R. Okafor");
        expect(m.reopen(" I. Brandt ", "  one more   passenger ")).toBe(true);
        expect(m.isSealed()).toBe(false);
        expect(m.sealedBy()).toBe("");
        expect(m.amendments()).toEqual([
            { by: "I. Brandt", text: "reopened: one more passenger" },
            { by: "R. Okafor", text: "sealed" },
        ]);
        expect(m.addPerson(rider(1, { boardLeg: 2 }))).toBe(true);
        expect(m.seal("I. Brandt")).toBe(true);
        expect(m.amendments()).toHaveLength(3);
    });
    add("Manifest.reopen: refused for a draft, and without a reason or a name", () => {
        const m = trip();
        expect(m.reopen("I. Brandt", "one more passenger")).toBe(false);
        m.seal("R. Okafor");
        expect(m.reopen("I. Brandt", "   ")).toBe(false);
        expect(m.reopen("  ", "one more passenger")).toBe(false);
        expect(m.isSealed()).toBe(true);
        expect(m.amendments()).toEqual([{ by: "R. Okafor", text: "sealed" }]);
    });

    // --------------------------------------------------------------------------------------------- summary

    add("guestPence: nothing while the people fit the berths", () => {
        expect(mod.guestPence(trip())).toBe(0);
        expect(mod.guestPence(small())).toBe(0);
    });
    add("guestPence: each person beyond the berths, on each leg they are beyond", () => {
        expect(mod.guestPence(trouble())).toBe(3900);
        const m = small();
        m.addLeg(leg({ from: "Ashby Top Lock", to: "Merrow Junction", departMin: 780, locks: 0 }));
        m.addPerson(rider(1, { leaveLeg: 1 }));
        m.addPerson(rider(2, { age: 1, weightKg: 0 }));
        expect(mod.guestPence(m)).toBe(650);
    });
    add("summarise: totals over the legs and the busiest leg", () => {
        expect(mod.summarise(trip())).toEqual({
            legs: 3,
            cruisingMin: 455,
            distanceM: 27400,
            locks: 8,
            peakPeople: 4,
            peakLoadKg: 376,
            guestPence: 0,
        });
        expect(mod.summarise(trouble())).toEqual({
            legs: 2,
            cruisingMin: 505,
            distanceM: 35600,
            locks: 5,
            peakPeople: 6,
            peakLoadKg: 534,
            guestPence: 3900,
        });
    });
    add("summarise: a manifest with nothing on it", () => {
        expect(mod.summarise(new mod.Manifest("Dabchick", "wren"))).toEqual({
            legs: 0,
            cruisingMin: 0,
            distanceM: 0,
            locks: 0,
            peakPeople: 0,
            peakLoadKg: 0,
            guestPence: 0,
        });
    });

    // ------------------------------------------------------------------------------------------- rendering

    add("renderLegLine: the leg's number from 1, its day and times, and what is on the way", () => {
        const times = mod.legTimes(copyOf(TRIP_LEGS));
        expect(TRIP_LEGS.map((l, i) => mod.renderLegLine(l, i, times[i]))).toEqual(TRIP_SHEET.slice(4, 7));
    });
    add("renderLegLine: one lock and one bridge, and a two-digit leg number", () => {
        const one = leg({ distanceM: 850, locks: 1, swingBridges: 1 });
        expect(mod.renderLegLine(one, 9, { startMin: 1920, endMin: 1950 })).toBe(
            "  10 D2 08:00-08:30  Tolland Wharf > Ashby Top Lock  850 m, 1 lock, 1 bridge  (30m)",
        );
        const plain = leg({ distanceM: 4000, locks: 0 });
        expect(mod.renderLegLine(plain, 0, { startMin: 1410, endMin: 1470 })).toBe(
            "  1  D1 23:30-00:30  Tolland Wharf > Ashby Top Lock  4.0 km  (1h)",
        );
    });
    add("renderPersonLine: id, name, role, weight and legs in columns", () => {
        expect(mod.renderPersonLine(person(), 3)).toBe(TRIP_SHEET[9]);
        expect(mod.renderPersonLine(TRIP_PEOPLE[3], 3)).toBe(TRIP_SHEET[12]);
        expect(mod.renderPersonLine(person({ id: "P-15", surname: "Quist", given: "Bo", role: "crew", weightKg: 100.4 }), 1)).toBe(
            "  P-15    QUIST, Bo                 crew       101 kg  all legs",
        );
    });
    add("renderPersonLine: a non-swimmer is marked", () => {
        expect(mod.renderPersonLine(TRIP_PEOPLE[0], 3)).toBe(TRIP_SHEET[14]);
        expect(mod.renderPersonLine(TRIP_PEOPLE[4], 3)).toBe(TRIP_SHEET[13]);
    });
    add("renderLoadLine: count, label, place and the row's weight", () => {
        expect(TRIP_LOAD.map(mod.renderLoadLine)).toEqual(TRIP_SHEET.slice(17, 20));
    });
    add("renderLoadLine: the row's weight is rounded up", () => {
        expect(mod.renderLoadLine({ label: "kedge", unitKg: 4.125, count: 2, stowed: "cabin" })).toBe(
            "  2 x kedge (cabin)  9 kg",
        );
        expect(mod.renderLoadLine({ label: "warp", unitKg: 3.5, count: 1, stowed: "fore" })).toBe("  1 x warp (fore)  4 kg");
    });
    add("renderProblemLine: errors and warnings, by leg from 1", () => {
        expect(TROUBLE_PROBLEMS.map(mod.renderProblemLine)).toEqual(TROUBLE_SHEET.slice(24));
    });
    add("renderProblemLine: a problem with no detail", () => {
        expect(mod.renderProblemLine({ code: "no-skipper", severity: "error", leg: 0, detail: "" })).toBe(
            "  !! leg 1  no-skipper",
        );
        expect(mod.renderProblemLine({ code: "no-legs", severity: "error", leg: mod.NO_LEG, detail: "" })).toBe(
            "  !! all    no-legs",
        );
        expect(mod.renderProblemLine({ code: "leg-early", severity: "warning", leg: 11, detail: "departs 07:59" })).toBe(
            "   ! leg 12 leg-early: departs 07:59",
        );
    });
    add("renderManifest: a sound draft", () => {
        expect(mod.renderManifest(trip())).toBe(TRIP_SHEET.join("\n") + "\n");
    });
    add("renderManifest: a draft with problems and day guests", () => {
        expect(mod.renderManifest(trouble())).toBe(TROUBLE_SHEET.join("\n") + "\n");
    });
    add("renderManifest: a manifest with nothing on it", () => {
        expect(mod.renderManifest(new mod.Manifest("Dabchick", "wren"))).toBe(
            [
                "PASSAGE MANIFEST  Dabchick (wren)",
                "Draft",
                "",
                "Legs",
                "",
                "People",
                "",
                "Peak: 0 of 4 people, 0 of 520 kg",
                "",
                "Problems",
                "  !! all    no-legs",
                "",
            ].join("\n"),
        );
    });
    add("renderManifest: a draft with nothing worse than warnings still lists them", () => {
        const m = small({ departMin: 450 });
        m.removePerson("S-2");
        expect(mod.renderManifest(m)).toBe(
            [
                "PASSAGE MANIFEST  Dabchick (wren)",
                "Draft",
                "",
                "Legs",
                "  1  D1 07:30-09:50  Tolland Wharf > Ashby Top Lock  6.4 km, 5 locks  (2h 20m)",
                "",
                "People",
                "  S-1     OKAFOR, Ruth              skipper    80 kg   all legs",
                "",
                "Peak: 1 of 4 people, 80 of 520 kg",
                "",
                "Problems",
                "   ! leg 1  leg-early: departs 07:30",
                "   ! leg 1  no-crew: 5 locks",
                "",
            ].join("\n"),
        );
    });
    add("renderManifest: a sealed sheet with its amendments counted", () => {
        const m = trip();
        m.amend("I. Brandt", "weights checked");
        m.seal("R. Okafor");
        const sheet = [...TRIP_SHEET];
        sheet[1] = "Sealed by R. Okafor";
        expect(mod.renderManifest(m)).toBe([...sheet, "", "Amendments: 2", ""].join("\n"));
    });
    add("renderManifest: amendments on a draft with problems", () => {
        const m = trouble();
        m.amend("R. Okafor", "rang the hirer about the roof");
        expect(mod.renderManifest(m)).toBe([...TROUBLE_SHEET, "", "Amendments: 1", ""].join("\n"));
    });

    // --------------------------------------------------------------------------------------------- reading

    add("readManifest: legs, people and gear from the office export", () => {
        const { manifest } = mod.readManifest(" Marsh  Harrier", "HERON", EXPORT_TEXT);
        expect(manifest.boatName).toBe("Marsh Harrier");
        expect(manifest.limits.cls).toBe("heron");
        expect(manifest.legList()).toEqual([TRIP_LEGS[0], TRIP_LEGS[1]]);
        expect(manifest.roster()).toEqual([
            person(),
            person({ id: "P-02", surname: "Brandt", given: "Ilse", role: "crew", age: 31, weightKg: 61.2, leaveLeg: 2 }),
            person({ id: "P-04", surname: "abbot", given: "Wen", role: "passenger", age: 67, weightKg: 0, swimmer: false,
                boardLeg: 1, leaveLeg: 2 }),
        ]);
        expect(manifest.loadList()).toEqual([{ label: "gas bottle", unitKg: 13.5, count: 3, stowed: "aft" }]);
    });
    add("readManifest: the lines it could not take, numbered from 1", () => {
        expect(mod.readManifest("Marsh Harrier", "heron", EXPORT_TEXT).rejected).toEqual([5, 8, 9, 10, 13]);
    });
    add("readManifest: nothing to read", () => {
        const { manifest, rejected } = mod.readManifest("Dabchick", "wren", "\n# nothing yet\n\n");
        expect(rejected).toEqual([]);
        expect(manifest.legCount).toBe(0);
        expect(manifest.roster()).toEqual([]);
        expect(() => mod.readManifest("Dabchick", "punt", "")).toThrow("unknown boat class: punt");
    });

    const unknown = skip.filter((name) => !cases.some(([known]) => known === name));
    if (unknown.length > 0) {
        throw new Error(`unchanged: no case is named ${unknown.map((name) => `"${name}"`).join(", ")}`);
    }
    describe("src/manifest.ts does what it did", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) {
                it(name, run);
            }
        }
    });
}
