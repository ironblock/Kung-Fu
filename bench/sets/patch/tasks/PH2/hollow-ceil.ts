// The passage manifest of a hire boat going out: its legs, who is aboard for each, what it carries,
// and the checks the office runs before the boat is let go.

export type Role = "skipper" | "crew" | "passenger";
export type Stowage = "fore" | "aft" | "cabin" | "roof";
export type AgeBand = "infant" | "child" | "adult";
export type Severity = "error" | "warning";

export type ProblemCode =
    | "no-legs"
    | "bad-legs"
    | "skipper-age"
    | "over-roof"
    | "leg-order"
    | "leg-gap"
    | "leg-early"
    | "leg-late"
    | "leg-long"
    | "no-skipper"
    | "two-skippers"
    | "no-crew"
    | "over-people"
    | "over-load"
    | "lifejackets";

export interface Leg {
    from: string;
    to: string;
    /** Day of the passage; 0 is the day the boat goes out. */
    day: number;
    /** Minutes from midnight on that day. */
    departMin: number;
    distanceM: number;
    locks: number;
    swingBridges: number;
}

export interface Person {
    id: string;
    surname: string;
    given: string;
    role: Role;
    /** Whole years on the day the boat goes out. */
    age: number;
    /** 0 when the booking form left it blank. */
    weightKg: number;
    swimmer: boolean;
    boardLeg: number;
    leaveLeg: number;
}

export interface LoadItem {
    label: string;
    unitKg: number;
    count: number;
    stowed: Stowage;
}

export interface BoatLimits {
    cls: string;
    berths: number;
    maxPeople: number;
    /** People and gear together. */
    maxLoadKg: number;
    maxRoofKg: number;
    lifejackets: number;
}

export interface LegTimes {
    startMin: number;
    endMin: number;
}

export interface LegLoad {
    peopleKg: number;
    gearKg: number;
    roofKg: number;
    totalKg: number;
}

export interface Problem {
    code: ProblemCode;
    severity: Severity;
    leg: number;
    detail: string;
}

export interface Amendment {
    by: string;
    text: string;
}

export interface Summary {
    legs: number;
    cruisingMin: number;
    distanceM: number;
    locks: number;
    peakPeople: number;
    peakLoadKg: number;
    guestPence: number;
}

export interface ReadResult {
    manifest: Manifest;
    rejected: number[];
}

/** In `Person.leaveLeg`: stays aboard to the end of the passage. */
export const TO_END = -1;
/** In `Problem.leg`: the problem is about the manifest as a whole. */
export const NO_LEG = -1;
/** What `parseClock` gives for text that is not a time. */
export const NO_TIME = -1;

export const DAY_MIN = 24 * 60;

const CRUISE_M_PER_MIN = 80;
const LOCK_MIN = 12;
const BRIDGE_MIN = 4;
const STEP_MIN = 5;

const FIRST_DEPART_MIN = 8 * 60;
const LAST_ARRIVE_MIN = 19 * 60 + 30;
const MAX_LEG_MIN = 6 * 60;

const INFANT_UNDER = 2;
const CHILD_UNDER = 12;
const SKIPPER_MIN_AGE = 18;

const STANDARD_KG: Record<AgeBand, number> = { infant: 12, child: 35, adult: 82 };

// charged per leg for each person carried beyond the boat's berths
export const DAY_GUEST_PENCE = 650;

export const BOAT_CLASSES: Record<string, BoatLimits> = {
    wren: { cls: "wren", berths: 2, maxPeople: 4, maxLoadKg: 520, maxRoofKg: 40, lifejackets: 4 },
    heron: { cls: "heron", berths: 4, maxPeople: 6, maxLoadKg: 780, maxRoofKg: 60, lifejackets: 6 },
    kingfisher: { cls: "kingfisher", berths: 6, maxPeople: 8, maxLoadKg: 1040, maxRoofKg: 80, lifejackets: 8 },
    bittern: { cls: "bittern", berths: 8, maxPeople: 12, maxLoadKg: 1500, maxRoofKg: 110, lifejackets: 10 },
};

const ROLE_RANK: Record<Role, number> = { skipper: 0, crew: 1, passenger: 2 };

const SEVERITY: Record<ProblemCode, Severity> = {
    "no-legs": "error",
    "bad-legs": "error",
    "skipper-age": "error",
    "over-roof": "error",
    "leg-order": "error",
    "leg-gap": "warning",
    "leg-early": "warning",
    "leg-late": "error",
    "leg-long": "warning",
    "no-skipper": "error",
    "two-skippers": "error",
    "no-crew": "warning",
    "over-people": "error",
    "over-load": "error",
    "lifejackets": "error",
};

const PROBLEM_ORDER: ProblemCode[] = [
    "no-legs",
    "bad-legs",
    "skipper-age",
    "over-roof",
    "leg-order",
    "leg-gap",
    "leg-early",
    "leg-late",
    "leg-long",
    "no-skipper",
    "two-skippers",
    "no-crew",
    "over-people",
    "over-load",
    "lifejackets",
];

function squash(text: string): string {
    return text.trim().replace(/\s+/g, " ");
}

function pad(text: string, width: number): string {
    return text.length >= width ? text : text + " ".repeat(width - text.length);
}

function two(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

function compareText(a: string, b: string): number {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : 1;
}

/** A whole number written in digits, or -1. */
function wholeNumber(text: string): number {
    return /^\d+$/.test(text) ? Number(text) : -1;
}

function isRole(text: string): text is Role {
    return text === "skipper" || text === "crew" || text === "passenger";
}

function isStowage(text: string): text is Stowage {
    return text === "fore" || text === "aft" || text === "cabin" || text === "roof";
}

export function ageBand(age: number): AgeBand {
    if (age < INFANT_UNDER) {
        return "infant";
    }
    return age < CHILD_UNDER ? "child" : "adult";
}

export function personWeightKg(p: Person): number {
    if (p.weightKg <= 0) {
        // nothing on the form: the standard weight for the age
        return STANDARD_KG[ageBand(p.age)];
    }
    return Math.ceil(p.weightKg);
}

export function isAboard(p: Person, legIndex: number): boolean {
    if (legIndex < p.boardLeg) {
        return false;
    }
    // leaveLeg is the first leg the person is not aboard for
    return p.leaveLeg === TO_END || legIndex < p.leaveLeg;
}

export function headcount(people: Person[]): number {
    // babes in arms do not count against the licence
    return people.filter((p) => ageBand(p.age) !== "infant").length;
}

/** Puts a person from the form into the shape the manifest keeps. Works on the object it is given. */
export function tidyPerson(p: Person): Person {
    p.id = p.id.trim().toUpperCase();
    p.surname = squash(p.surname);
    p.given = squash(p.given);
    p.age = p.age > 0 ? Math.floor(p.age) : 0;
    p.weightKg = p.weightKg > 0 ? p.weightKg : 0;
    p.boardLeg = p.boardLeg > 0 ? Math.floor(p.boardLeg) : 0;
    p.leaveLeg = p.leaveLeg >= 0 ? Math.floor(p.leaveLeg) : TO_END;
    return p;
}

export function comparePeople(a: Person, b: Person): number {
    if (a.role !== b.role) {
        return ROLE_RANK[a.role] - ROLE_RANK[b.role];
    }
    const bySurname = compareText(a.surname.toLowerCase(), b.surname.toLowerCase());
    if (bySurname !== 0) {
        return bySurname;
    }
    const byGiven = compareText(a.given.toLowerCase(), b.given.toLowerCase());
    return byGiven !== 0 ? byGiven : compareText(a.id, b.id);
}

export function legMinutes(leg: Leg): number {
    const cruising = leg.distanceM / CRUISE_M_PER_MIN;
    const working = leg.locks * LOCK_MIN + leg.swingBridges * BRIDGE_MIN;
    // the timetable works in five-minute steps, and a leg is never rounded down
    return Math.ceil((cruising + working) / STEP_MIN) * STEP_MIN;
}

/** Start and end of each leg, in minutes from midnight at the start of day 0. */
export function legTimes(legs: Leg[]): LegTimes[] {
    return legs.map((leg) => {
        const startMin = leg.day * DAY_MIN + leg.departMin;
        return { startMin, endMin: startMin + legMinutes(leg) };
    });
}

export function parseClock(text: string): number {
    const found = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
    if (found === null) {
        return NO_TIME;
    }
    const hours = Number(found[1]);
    const minutes = Number(found[2]);
    return hours > 23 || minutes > 59 ? NO_TIME : hours * 60 + minutes;
}

export function formatClock(min: number): string {
    if (min < 0) {
        return "--:--";
    }
    const inDay = min % DAY_MIN;
    return `${two(Math.floor(inDay / 60))}:${two(inDay % 60)}`;
}

/** A time counted from the start of day 0, with its day as the hirer sees it: the first day is D1. */
export function formatStamp(min: number): string {
    if (min < 0) {
        return "-- --:--";
    }
    return `D${Math.floor(min / DAY_MIN) + 1} ${formatClock(min)}`;
}

export function formatDuration(min: number): string {
    const hours = Math.floor(min / 60);
    const rest = min % 60;
    if (hours === 0) {
        return `${rest}m`;
    }
    return rest === 0 ? `${hours}h` : `${hours}h ${two(rest)}m`;
}

export function formatDistance(metres: number): string {
    if (metres < 1000) {
        return `${Math.round(metres)} m`;
    }
    const tenths = Math.round(metres / 100);
    return `${Math.floor(tenths / 10)}.${tenths % 10} km`;
}

export function formatPence(pence: number): string {
    const whole = Math.abs(Math.round(pence));
    const text = `£${Math.floor(whole / 100)}.${two(whole % 100)}`;
    return pence < 0 && whole > 0 ? `-${text}` : text;
}

/** Weight of the gear, or of the gear stowed in one place, in whole kilos. */
export function gearKg(load: LoadItem[], stowed?: Stowage): number {
    let total = 0;
    for (const item of load) {
        if (stowed === undefined || item.stowed === stowed) {
            total += item.unitKg * item.count;
        }
    }
    return Math.ceil(total);
}

/** Which legs a person is aboard for, as the hirer counts them: from 1. */
export function legSpan(p: Person, legCount: number): string {
    const first = p.boardLeg + 1;
    const last = p.leaveLeg === TO_END || p.leaveLeg > legCount ? legCount : p.leaveLeg;
    if (last < first) {
        return "no legs";
    }
    if (first === 1 && last === legCount) {
        return "all legs";
    }
    return first === last ? `leg ${first}` : `legs ${first}-${last}`;
}

function parseLegSpan(text: string): { boardLeg: number; leaveLeg: number } | null {
    if (text === "") {
        return { boardLeg: 0, leaveLeg: TO_END };
    }
    const found = /^(\d+)(?:\s*-\s*(\d*))?$/.exec(text);
    if (found === null) {
        return null;
    }
    // the form counts legs from 1 and gives the last leg aboard
    const first = Number(found[1]);
    if (first < 1) {
        return null;
    }
    if (found[2] === undefined) {
        return { boardLeg: first - 1, leaveLeg: first };
    }
    if (found[2] === "") {
        return { boardLeg: first - 1, leaveLeg: TO_END };
    }
    const last = Number(found[2]);
    return last < first ? null : { boardLeg: first - 1, leaveLeg: last };
}

/**
 * One leg from the office export: `from;to;day;HH:MM;km;locks;bridges`.
 * The day counts from 1 and the distance is in kilometres. Locks and bridges may be left off.
 */
export function parseLegLine(line: string): Leg | null {
    const fields = line.split(";").map((field) => field.trim());
    if (fields.length < 5 || fields[0] === "" || fields[1] === "" || fields[4] === "") {
        return null;
    }
    const day = wholeNumber(fields[2]);
    const departMin = parseClock(fields[3]);
    const km = Number(fields[4]);
    if (day < 1 || departMin === NO_TIME || !(km >= 0)) {
        return null;
    }
    const locks = fields.length > 5 && fields[5] !== "" ? wholeNumber(fields[5]) : 0;
    const swingBridges = fields.length > 6 && fields[6] !== "" ? wholeNumber(fields[6]) : 0;
    if (locks < 0 || swingBridges < 0) {
        return null;
    }
    return {
        from: squash(fields[0]),
        to: squash(fields[1]),
        day: day - 1,
        departMin,
        distanceM: Math.round(km * 1000),
        locks,
        swingBridges,
    };
}

/** One person from the booking form: `id;surname;given;role;age;weight;swims;legs`. */
export function parsePersonLine(line: string): Person | null {
    const fields = line.split(";").map((field) => field.trim());
    if (fields.length < 7 || fields[0] === "" || fields[1] === "") {
        return null;
    }
    const role = fields[3].toLowerCase();
    const age = wholeNumber(fields[4]);
    const weightKg = fields[5] === "" ? 0 : Number(fields[5]);
    if (!isRole(role) || age < 0 || !(weightKg >= 0)) {
        return null;
    }
    const span = parseLegSpan(fields.length > 7 ? fields[7] : "");
    if (span === null) {
        return null;
    }
    return tidyPerson({
        id: fields[0],
        surname: fields[1],
        given: fields[2],
        role,
        age,
        weightKg,
        swimmer: /^(y|yes)$/i.test(fields[6]),
        boardLeg: span.boardLeg,
        leaveLeg: span.leaveLeg,
    });
}

/** One row of gear: `label;unit kg;count;stowed`. The count may be left blank for one. */
export function parseLoadLine(line: string): LoadItem | null {
    const fields = line.split(";").map((field) => field.trim());
    if (fields.length < 4 || fields[0] === "" || fields[1] === "") {
        return null;
    }
    const unitKg = Number(fields[1]);
    const count = fields[2] === "" ? 1 : wholeNumber(fields[2]);
    const stowed = fields[3].toLowerCase();
    if (!(unitKg >= 0) || count < 1 || !isStowage(stowed)) {
        return null;
    }
    return { label: squash(fields[0]), unitKg, count, stowed };
}

function compareProblems(a: Problem, b: Problem): number {
    if (a.leg !== b.leg) {
        return a.leg - b.leg;
    }
    if (a.code !== b.code) {
        return PROBLEM_ORDER.indexOf(a.code) - PROBLEM_ORDER.indexOf(b.code);
    }
    return compareText(a.detail, b.detail);
}

function problem(code: ProblemCode, leg: number, detail: string): Problem {
    return { code, severity: SEVERITY[code], leg, detail };
}

/** The problems that show in the legs alone: their times, their order, and whether each starts where the last ended. */
export function checkLegs(legs: Leg[]): Problem[] {
    const found: Problem[] = [];
    const times = legTimes(legs);
    legs.forEach((leg, i) => {
        const minutes = legMinutes(leg);
        if (leg.departMin < FIRST_DEPART_MIN) {
            found.push(problem("leg-early", i, `departs ${formatClock(leg.departMin)}`));
        }
        // a leg that runs past midnight is late too, so the end is not wrapped to the clock here
        if (leg.departMin + minutes > LAST_ARRIVE_MIN) {
            found.push(problem("leg-late", i, `arrives ${formatClock(leg.departMin + minutes)}`));
        }
        if (minutes > MAX_LEG_MIN) {
            found.push(problem("leg-long", i, formatDuration(minutes)));
        }
        if (i === 0) {
            return;
        }
        const before = legs[i - 1];
        if (times[i].startMin < times[i - 1].endMin) {
            found.push(problem("leg-order", i, `starts before leg ${i} ends`));
        }
        if (before.to.toLowerCase() !== leg.from.toLowerCase()) {
            found.push(problem("leg-gap", i, `${before.to} to ${leg.from}`));
        }
    });
    return found.sort(compareProblems);
}

export class Manifest {
    readonly boatName: string;
    readonly limits: BoatLimits;
    private legs: Leg[] = [];
    private people: Person[] = [];
    private load: LoadItem[] = [];
    private log: Amendment[] = [];
    // "" while the manifest is a draft
    private sealer = "";

    constructor(boatName: string, cls: string) {
        const limits = BOAT_CLASSES[cls.trim().toLowerCase()];
        if (limits === undefined) {
            throw new Error(`unknown boat class: ${cls}`);
        }
        this.boatName = squash(boatName);
        this.limits = { ...limits };
    }

    get legCount(): number {
        return this.legs.length;
    }

    isSealed(): boolean {
        return this.sealer !== "";
    }

    sealedBy(): string {
        return this.sealer;
    }

    private mustBeDraft(): void {
        if (this.sealer !== "") {
            throw new Error("manifest is sealed");
        }
    }

    /** Adds a leg at the end and gives its index. */
    addLeg(leg: Leg): number {
        this.mustBeDraft();
        if (!(leg.distanceM >= 0) || !(leg.locks >= 0) || !(leg.swingBridges >= 0)) {
            throw new RangeError("a leg cannot have a negative measure");
        }
        this.legs.push({ ...leg, from: squash(leg.from), to: squash(leg.to) });
        return this.legs.length - 1;
    }

    addPerson(person: Person): boolean {
        this.mustBeDraft();
        const tidy = tidyPerson({ ...person });
        if (tidy.id === "" || this.people.some((p) => p.id === tidy.id)) {
            return false;
        }
        this.people.push(tidy);
        return true;
    }

    removePerson(id: string): boolean {
        this.mustBeDraft();
        const wanted = id.trim().toUpperCase();
        const at = this.people.findIndex((p) => p.id === wanted);
        if (at < 0) {
            return false;
        }
        this.people.splice(at, 1);
        return true;
    }

    addLoad(item: LoadItem): boolean {
        this.mustBeDraft();
        if (!(item.count > 0) || !(item.unitKg >= 0)) {
            return false;
        }
        const label = squash(item.label);
        const same = this.load.find(
            (l) =>
                l.stowed === item.stowed &&
                Math.ceil(l.unitKg) === Math.ceil(item.unitKg) &&
                l.label.toLowerCase() === label.toLowerCase(),
        );
        if (same !== undefined) {
            // the same thing in the same place is one row, and the unit weight first given stands
            same.count += item.count;
        } else {
            this.load.push({ ...item, label });
        }
        return true;
    }

    legList(): Leg[] {
        return this.legs.map((leg) => ({ ...leg }));
    }

    loadList(): LoadItem[] {
        return this.load.map((item) => ({ ...item }));
    }

    /** Everyone on the manifest, skipper first, then crew, then passengers, each by name. */
    roster(): Person[] {
        return this.people.map((p) => ({ ...p })).sort(comparePeople);
    }

    /** The people aboard for a leg, in the order they were put on the manifest. */
    aboardOn(legIndex: number): Person[] {
        if (legIndex < 0 || legIndex >= this.legs.length) {
            return [];
        }
        return this.people.filter((p) => isAboard(p, legIndex)).map((p) => ({ ...p }));
    }

    headcountOn(legIndex: number): number {
        return headcount(this.aboardOn(legIndex));
    }

    loadOn(legIndex: number): LegLoad {
        const peopleKg = this.aboardOn(legIndex).reduce((sum, p) => sum + personWeightKg(p), 0);
        const gear = gearKg(this.load);
        return { peopleKg, gearKg: gear, roofKg: gearKg(this.load, "roof"), totalKg: peopleKg + gear };
    }

    private peopleProblems(): Problem[] {
        const found: Problem[] = [];
        for (const p of this.people) {
            const pastEnd = p.boardLeg >= this.legs.length || p.leaveLeg > this.legs.length;
            if (pastEnd || (p.leaveLeg !== TO_END && p.leaveLeg <= p.boardLeg)) {
                found.push(problem("bad-legs", NO_LEG, p.id));
            }
            if (p.role === "skipper" && p.age < SKIPPER_MIN_AGE) {
                found.push(problem("skipper-age", NO_LEG, p.id));
            }
        }
        return found;
    }

    private legProblems(legIndex: number): Problem[] {
        const found: Problem[] = [];
        const aboard = this.aboardOn(legIndex);
        const skippers = aboard.filter((p) => p.role === "skipper");
        if (skippers.length === 0) {
            found.push(problem("no-skipper", legIndex, ""));
        } else if (skippers.length > 1) {
            found.push(problem("two-skippers", legIndex, skippers.map((p) => p.id).join(", ")));
        }
        // someone other than the skipper has to work the locks, and a child cannot
        const hands = aboard.filter((p) => p.role === "crew" && ageBand(p.age) === "adult");
        if (this.legs[legIndex].locks > 0 && hands.length === 0) {
            found.push(problem("no-crew", legIndex, `${this.legs[legIndex].locks} locks`));
        }
        const people = headcount(aboard);
        if (people > this.limits.maxPeople) {
            found.push(problem("over-people", legIndex, `${people} of ${this.limits.maxPeople}`));
        }
        const load = this.loadOn(legIndex);
        if (load.totalKg > this.limits.maxLoadKg) {
            found.push(problem("over-load", legIndex, `${load.totalKg} kg of ${this.limits.maxLoadKg} kg`));
        }
        const jackets = aboard.filter((p) => !p.swimmer || ageBand(p.age) !== "adult").length;
        if (jackets > this.limits.lifejackets) {
            found.push(problem("lifejackets", legIndex, `${jackets} needed, ${this.limits.lifejackets} aboard`));
        }
        return found;
    }

    /** Everything wrong with the manifest: whole-manifest problems first, then leg by leg. */
    problems(): Problem[] {
        const found: Problem[] = [];
        if (this.legs.length === 0) {
            found.push(problem("no-legs", NO_LEG, ""));
        }
        found.push(...this.peopleProblems());
        const roofKg = gearKg(this.load, "roof");
        if (roofKg > this.limits.maxRoofKg) {
            found.push(problem("over-roof", NO_LEG, `${roofKg} kg of ${this.limits.maxRoofKg} kg`));
        }
        found.push(...checkLegs(this.legs));
        for (let i = 0; i < this.legs.length; i++) {
            found.push(...this.legProblems(i));
        }
        return found.sort(compareProblems);
    }

    /** Notes a change. A sealed manifest can still be amended. */
    amend(by: string, text: string): boolean {
        const who = squash(by);
        const what = squash(text);
        if (who === "" || what === "") {
            return false;
        }
        this.log.push({ by: who, text: what });
        return true;
    }

    amendments(): Amendment[] {
        // newest first: the office reads these from the top
        return this.log.map((entry) => ({ ...entry })).reverse();
    }

    /** Seals the manifest in the name of whoever checked it. Refused while any error stands. */
    seal(by: string): boolean {
        const who = squash(by);
        if (who === "" || this.isSealed()) {
            return false;
        }
        if (this.problems().some((p) => p.severity === "error")) {
            return false;
        }
        this.sealer = who;
        this.log.push({ by: who, text: "sealed" });
        return true;
    }

    reopen(by: string, reason: string): boolean {
        const why = squash(reason);
        if (!this.isSealed() || why === "") {
            return false;
        }
        if (!this.amend(by, `reopened: ${why}`)) {
            return false;
        }
        this.sealer = "";
        return true;
    }
}

/** What the hirer owes for people carried beyond the boat's berths, leg by leg. */
export function guestPence(m: Manifest): number {
    let pence = 0;
    for (let i = 0; i < m.legCount; i++) {
        const over = m.headcountOn(i) - m.limits.berths;
        if (over > 0) {
            pence += over * DAY_GUEST_PENCE;
        }
    }
    return pence;
}

export function summarise(m: Manifest): Summary {
    const legs = m.legList();
    const summary: Summary = {
        legs: legs.length,
        cruisingMin: 0,
        distanceM: 0,
        locks: 0,
        peakPeople: 0,
        peakLoadKg: 0,
        guestPence: guestPence(m),
    };
    legs.forEach((leg, i) => {
        summary.cruisingMin += legMinutes(leg);
        summary.distanceM += leg.distanceM;
        summary.locks += leg.locks;
        summary.peakPeople = Math.max(summary.peakPeople, m.headcountOn(i));
        summary.peakLoadKg = Math.max(summary.peakLoadKg, m.loadOn(i).totalKg);
    });
    return summary;
}

export function renderLegLine(leg: Leg, index: number, times: LegTimes): string {
    const when = `${formatStamp(times.startMin)}-${formatClock(times.endMin)}`;
    let works = "";
    if (leg.locks > 0) {
        works += `, ${leg.locks} ${leg.locks === 1 ? "lock" : "locks"}`;
    }
    if (leg.swingBridges > 0) {
        works += `, ${leg.swingBridges} ${leg.swingBridges === 1 ? "bridge" : "bridges"}`;
    }
    const route = `${leg.from} > ${leg.to}  ${formatDistance(leg.distanceM)}${works}`;
    return `  ${pad(String(index + 1), 3)}${when}  ${route}  (${formatDuration(times.endMin - times.startMin)})`;
}

export function renderPersonLine(p: Person, legCount: number): string {
    const name = `${p.surname.toUpperCase()}, ${p.given}`;
    const weight = `${personWeightKg(p)} kg`;
    const line = `  ${pad(p.id, 8)}${pad(name, 26)}${pad(p.role, 11)}${pad(weight, 8)}${legSpan(p, legCount)}`;
    return p.swimmer ? line : `${line}  non-swimmer`;
}

export function renderLoadLine(item: LoadItem): string {
    const kg = Math.ceil(item.unitKg * item.count);
    return `  ${item.count} x ${item.label} (${item.stowed})  ${kg} kg`;
}

export function renderProblemLine(p: Problem): string {
    const mark = p.severity === "error" ? "!!" : " !";
    const where = p.leg === NO_LEG ? "all" : `leg ${p.leg + 1}`;
    return `  ${mark} ${pad(where, 7)}${p.detail === "" ? p.code : `${p.code}: ${p.detail}`}`;
}

/** The manifest as the sheet that goes in the boat's folder. */
export function renderManifest(m: Manifest): string {
    const legs = m.legList();
    const times = legTimes(legs);
    const out: string[] = [];
    out.push(`PASSAGE MANIFEST  ${m.boatName} (${m.limits.cls})`);
    out.push(m.isSealed() ? `Sealed by ${m.sealedBy()}` : "Draft");
    out.push("");
    out.push("Legs");
    legs.forEach((leg, i) => out.push(renderLegLine(leg, i, times[i])));
    out.push("");
    out.push("People");
    for (const p of m.roster()) {
        out.push(renderPersonLine(p, legs.length));
    }
    const load = m.loadList();
    if (load.length > 0) {
        out.push("");
        out.push("Load");
        for (const item of load) {
            out.push(renderLoadLine(item));
        }
    }
    const summary = summarise(m);
    out.push("");
    out.push(
        `Peak: ${summary.peakPeople} of ${m.limits.maxPeople} people, ` +
            `${summary.peakLoadKg} of ${m.limits.maxLoadKg} kg`,
    );
    if (summary.guestPence > 0) {
        out.push(`Day guests: ${formatPence(summary.guestPence)}`);
    }
    const problems = m.problems();
    if (problems.length > 0) {
        out.push("");
        out.push("Problems");
        for (const p of problems) {
            out.push(renderProblemLine(p));
        }
    }
    const notes = m.amendments();
    if (notes.length > 0) {
        out.push("");
        out.push(`Amendments: ${notes.length}`);
    }
    return out.join("\n") + "\n";
}

/**
 * Builds a manifest from the office export. Each line is a letter, a semicolon, and a row:
 * `L;` a leg, `P;` a person, `G;` gear. Blank lines and lines that start with `#` are passed over.
 * `rejected` holds the numbers, from 1, of the lines that could not be read or were refused.
 */
export function readManifest(boatName: string, cls: string, text: string): ReadResult {
    const manifest = new Manifest(boatName, cls);
    const rejected: number[] = [];
    text.split("\n").forEach((raw, i) => {
        const line = raw.trim();
        if (line === "" || line.startsWith("#")) {
            return;
        }
        const kind = line.slice(0, 2).toUpperCase();
        const rest = line.slice(2);
        let taken = false;
        if (kind === "L;") {
            const leg = parseLegLine(rest);
            if (leg !== null) {
                manifest.addLeg(leg);
                taken = true;
            }
        } else if (kind === "P;") {
            const person = parsePersonLine(rest);
            taken = person !== null && manifest.addPerson(person);
        } else if (kind === "G;") {
            const item = parseLoadLine(rest);
            taken = item !== null && manifest.addLoad(item);
        }
        if (!taken) {
            rejected.push(i + 1);
        }
    });
    return { manifest, rejected };
}
