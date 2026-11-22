// The maintenance job log: what was reported on which boat, how far each job has got, what it used
// and what it cost. The summaries by boat and by week are worked out from the jobs each time.

export type JobState = "reported" | "booked" | "started" | "waiting" | "done" | "signed" | "dropped";
export type Priority = "routine" | "soon" | "urgent";
export type Grade = "apprentice" | "fitter" | "engineer";

export interface Move {
    to: JobState;
    day: number;
    by: string;
}

export interface PartLine {
    sku: string;
    qty: number;
    unitPence: number;
}

export interface TimeEntry {
    day: number;
    startMin: number;
    endMin: number;
    fitter: string;
    grade: Grade;
}

export interface Job {
    id: number;
    boatId: string;
    title: string;
    priority: Priority;
    state: JobState;
    openedDay: number;
    dueDay: number;
    closedDay: number;
    history: Move[];
    parts: PartLine[];
    time: TimeEntry[];
}

export interface JobCost {
    partsPence: number;
    handlingPence: number;
    labourMin: number;
    labourPence: number;
    totalPence: number;
}

export interface BoatSummary {
    boatId: string;
    jobs: number;
    open: number;
    lastDay: number;
    partsPence: number;
    labourMin: number;
    labourPence: number;
}

export interface WeekSummary {
    week: number;
    opened: number;
    closed: number;
    labourMin: number;
    labourPence: number;
    partsPence: number;
}

export const NO_DAY = -1;
export const NO_JOB = 0;
export const DAY_MIN = 1440;
export const JOB_STATES: readonly JobState[] = [
    "reported",
    "booked",
    "started",
    "waiting",
    "done",
    "signed",
    "dropped",
];

// Where a job may go from each state. Nothing leaves signed or dropped.
const MOVES: Record<JobState, readonly JobState[]> = {
    reported: ["booked", "dropped"],
    booked: ["started", "waiting", "dropped"],
    started: ["waiting", "done"],
    waiting: ["booked", "started", "dropped"],
    done: ["started", "signed"],
    signed: [],
    dropped: [],
};

// Labour, in pence for an hour. Each divides by four, so a quarter hour is a whole number of pence.
const RATE: Record<Grade, number> = {
    apprentice: 2400,
    fitter: 4200,
    engineer: 5800,
};

const BILLING_STEP_MIN = 15;
const HANDLING_PER_MILLE = 125;

const RANK: Record<Priority, number> = {
    urgent: 0,
    soon: 1,
    routine: 2,
};

function boatKey(boatId: string): string {
    return boatId.trim().toUpperCase();
}

function partKey(sku: string): string {
    return sku.trim().toUpperCase();
}

/** True while there is still work to do on a job in this state. */
export function isOpen(state: JobState): boolean {
    return state !== "done" && state !== "signed" && state !== "dropped";
}

/** A frozen job takes no more parts or time. A done job is not frozen: its sheet can still be put right. */
export function isFrozen(state: JobState): boolean {
    return state === "signed" || state === "dropped";
}

export function canMove(from: JobState, to: JobState, priority: Priority = "routine"): boolean {
    if (from === "reported" && to === "started") {
        // An urgent job may be started without being booked in first.
        return priority === "urgent";
    }
    return MOVES[from].includes(to);
}

export function nextStates(from: JobState, priority: Priority = "routine"): JobState[] {
    return JOB_STATES.filter((to) => canMove(from, to, priority));
}

/** The day a job should be finished by. */
export function dueFor(priority: Priority, openedDay: number): number {
    if (priority === "urgent") {
        return openedDay + 1;
    }
    if (priority === "soon") {
        return openedDay + 7;
    }
    // Routine work is fitted in around the rest and has no due day.
    return NO_DAY;
}

// The yard's week runs Saturday to Friday, because the hire boats turn round on a Saturday. Day 0 was a Monday.
// A week is known by the day number of its Saturday, and that is what this gives for the week that holds `day`.
export function weekOf(day: number): number {
    const sinceSaturday = (((day + 2) % 7) + 7) % 7;
    return day - sinceSaturday;
}

/** Minutes charged for one entry. */
export function billedMinutes(entry: TimeEntry): number {
    const worked = entry.endMin - entry.startMin;
    if (worked <= 0) {
        return 0;
    }
    // Every started quarter hour is charged.
    return Math.ceil(worked / BILLING_STEP_MIN) * BILLING_STEP_MIN;
}

function entryPence(entry: TimeEntry): number {
    return (billedMinutes(entry) * RATE[entry.grade]) / 60;
}

export function labourMinutes(job: Job): number {
    let minutes = 0;
    for (const entry of job.time) {
        minutes += billedMinutes(entry);
    }
    return minutes;
}

export function labourPence(job: Job): number {
    let pence = 0;
    for (const entry of job.time) {
        pence += entryPence(entry);
    }
    return pence;
}

export function partsCost(job: Job): number {
    let pence = 0;
    for (const line of job.parts) {
        pence += line.qty * line.unitPence;
    }
    return pence;
}

export function costOf(job: Job): JobCost {
    const partsPence = partsCost(job);
    // Handling is taken on the job's parts as a whole, so that it is rounded once and not line by line.
    const handlingPence = Math.round((partsPence * HANDLING_PER_MILLE) / 1000);
    const labourMin = labourMinutes(job);
    const labour = labourPence(job);
    return {
        partsPence,
        handlingPence,
        labourMin,
        labourPence: labour,
        totalPence: partsPence + handlingPence + labour,
    };
}

/** Puts parts on a job, or with a negative quantity takes them back off. Changes the job. */
export function addPart(job: Job, sku: string, qty: number, unitPence: number): boolean {
    if (isFrozen(job.state) || !Number.isInteger(qty) || qty === 0 || unitPence < 0) {
        return false;
    }
    const key = partKey(sku);
    if (key === "") {
        return false;
    }
    // The same part bought at another price is another line.
    const line = job.parts.find((p) => p.sku === key && p.unitPence === unitPence);
    if (line === undefined) {
        if (qty < 0) {
            return false;
        }
        job.parts.push({ sku: key, qty, unitPence });
        return true;
    }
    if (line.qty + qty < 0) {
        return false;
    }
    line.qty += qty;
    if (line.qty === 0) {
        job.parts.splice(job.parts.indexOf(line), 1);
    }
    return true;
}

/** Books time to a job. Changes the job, and keeps a copy of the entry, not the entry. */
export function addTime(job: Job, entry: TimeEntry): boolean {
    if (isFrozen(job.state) || entry.fitter.trim() === "") {
        return false;
    }
    if (entry.startMin < 0 || entry.endMin > DAY_MIN || entry.endMin <= entry.startMin) {
        return false;
    }
    if (entry.day < job.openedDay) {
        return false;
    }
    for (const other of job.time) {
        const sameShift = other.fitter === entry.fitter && other.day === entry.day;
        // Back to back is fine: an entry ends at the minute the next may begin.
        if (sameShift && entry.startMin < other.endMin && other.startMin < entry.endMin) {
            return false;
        }
    }
    job.time.push({ ...entry });
    return true;
}

/** How far past its due day a job is, measured on `day`, or on the day it closed if it has closed. */
export function lateBy(job: Job, day: number): number {
    if (job.dueDay === NO_DAY || job.state === "dropped") {
        return 0;
    }
    const at = job.closedDay === NO_DAY ? day : job.closedDay;
    // Yard weeks begin on a Saturday, and day 5 was the first Saturday.
    const yardWeek = (d: number): number => Math.trunc((d + 2) / 7);
    return Math.max(0, yardWeek(at) - yardWeek(job.dueDay));
}

/** Puts jobs in the order they should be worked. Sorts the array it is given, and returns it. */
export function sortJobs(jobs: Job[]): Job[] {
    return jobs.sort((a, b) => {
        if (a.priority !== b.priority) {
            return RANK[a.priority] - RANK[b.priority];
        }
        if (a.dueDay !== b.dueDay) {
            // A job with no due day goes after every job that has one.
            if (a.dueDay === NO_DAY) {
                return 1;
            }
            if (b.dueDay === NO_DAY) {
                return -1;
            }
            return a.dueDay - b.dueDay;
        }
        return a.id - b.id;
    });
}

export function formatPence(pence: number): string {
    const whole = Math.abs(Math.round(pence));
    const pounds = Math.floor(whole / 100);
    const rest = String(whole % 100).padStart(2, "0");
    return `${pence < 0 ? "-" : ""}£${pounds}.${rest}`;
}

/** One line for the job sheet, such as `#12 KESTREL urgent started: Stern gland weeping (£45.20)`. */
export function jobLine(job: Job): string {
    const cost = formatPence(costOf(job).totalPence);
    return `#${job.id} ${job.boatId} ${job.priority} ${job.state}: ${job.title} (${cost})`;
}

/** The boats that have a job in the list, each once, in alphabetical order. */
export function boatsOf(jobs: Job[]): string[] {
    const seen = new Set<string>();
    for (const job of jobs) {
        seen.add(boatKey(job.boatId));
    }
    return [...seen].sort();
}

export function summariseBoat(jobs: Job[], boatId: string): BoatSummary {
    const key = boatKey(boatId);
    const out: BoatSummary = {
        boatId: key,
        jobs: 0,
        open: 0,
        lastDay: NO_DAY,
        partsPence: 0,
        labourMin: 0,
        labourPence: 0,
    };
    for (const job of jobs) {
        // A dropped job was never done, so it is in no summary.
        if (boatKey(job.boatId) !== key || job.state === "dropped") {
            continue;
        }
        const cost = costOf(job);
        out.jobs += 1;
        if (isOpen(job.state)) {
            out.open += 1;
        }
        out.lastDay = Math.max(out.lastDay, job.history[0].day);
        out.partsPence += cost.partsPence + cost.handlingPence;
        out.labourMin += cost.labourMin;
        out.labourPence += cost.labourPence;
    }
    return out;
}

export function summariseWeek(jobs: Job[], day: number): WeekSummary {
    const start = weekOf(day);
    const end = start + 7;
    const out: WeekSummary = {
        week: start,
        opened: 0,
        closed: 0,
        labourMin: 0,
        labourPence: 0,
        partsPence: 0,
    };
    for (const job of jobs) {
        if (job.state === "dropped") {
            continue;
        }
        if (job.openedDay >= start && job.openedDay < end) {
            out.opened += 1;
        }
        // Parts go to the week the job closed in. Labour goes to the week it was worked in.
        if (job.closedDay !== NO_DAY && job.closedDay >= start && job.closedDay < end) {
            const cost = costOf(job);
            out.closed += 1;
            out.partsPence += cost.partsPence + cost.handlingPence;
        }
        for (const entry of job.time) {
            if (entry.day >= start && entry.day < end) {
                out.labourMin += billedMinutes(entry);
                out.labourPence += entryPence(entry);
            }
        }
    }
    return out;
}

export class WorkLog {
    private jobs: Map<number, Job> = new Map();
    private nextId = 1;

    get count(): number {
        return this.jobs.size;
    }

    /** Opens a job and gives its id, or NO_JOB when the boat or the title is blank. */
    open(boatId: string, title: string, priority: Priority, day: number, by: string): number {
        const boat = boatKey(boatId);
        const what = title.trim();
        if (boat === "" || what === "") {
            return NO_JOB;
        }
        const id = this.nextId;
        this.nextId += 1;
        this.jobs.set(id, {
            id,
            boatId: boat,
            title: what,
            priority,
            state: "reported",
            openedDay: day,
            dueDay: dueFor(priority, day),
            closedDay: NO_DAY,
            history: [{ to: "reported", day, by }],
            parts: [],
            time: [],
        });
        return id;
    }

    /** The job itself, not a copy. */
    get(id: number): Job | undefined {
        return this.jobs.get(id);
    }

    move(id: number, to: JobState, day: number, by: string): boolean {
        const job = this.jobs.get(id);
        if (job === undefined || !canMove(job.state, to, job.priority)) {
            return false;
        }
        // The history is kept newest first, and a move may not be dated before the one before it.
        if (day < job.history[0].day) {
            return false;
        }
        // Sign-off needs a second pair of eyes.
        if (to === "signed" && job.history.some((m) => m.to === "done" && m.by === by)) {
            return false;
        }
        if (to === "done") {
            job.closedDay = day;
        } else if (job.state === "done" && to === "started") {
            job.closedDay = NO_DAY;
        }
        job.state = to;
        job.history.unshift({ to, day, by });
        return true;
    }

    logTime(id: number, entry: TimeEntry): boolean {
        const job = this.jobs.get(id);
        return job !== undefined && addTime(job, entry);
    }

    usePart(id: number, sku: string, qty: number, unitPence: number): boolean {
        const job = this.jobs.get(id);
        return job !== undefined && addPart(job, sku, qty, unitPence);
    }

    /** Raises an open job's priority. It never lowers one, and never pushes a due day back. */
    escalate(id: number, priority: Priority, day: number): boolean {
        const job = this.jobs.get(id);
        if (job === undefined || !isOpen(job.state) || RANK[priority] >= RANK[job.priority]) {
            return false;
        }
        const due = dueFor(priority, day);
        job.priority = priority;
        if (job.dueDay === NO_DAY || due < job.dueDay) {
            job.dueDay = due;
        }
        return true;
    }

    /** The open jobs, in the order they should be worked. */
    openJobs(): Job[] {
        return sortJobs([...this.jobs.values()].filter((job) => isOpen(job.state)));
    }

    /** Every job the boat has had, dropped ones too, newest first. */
    forBoat(boatId: string): Job[] {
        const key = boatKey(boatId);
        return [...this.jobs.values()].filter((job) => job.boatId === key).reverse();
    }

    /** The jobs opened from `fromDay` up to but not on `toDay`, oldest first. */
    between(fromDay: number, toDay: number): Job[] {
        return [...this.jobs.values()].filter((job) => job.openedDay >= fromDay && job.openedDay < toDay);
    }

    boatSummary(boatId: string): BoatSummary {
        return summariseBoat([...this.jobs.values()], boatId);
    }

    weekSummary(day: number): WeekSummary {
        return summariseWeek([...this.jobs.values()], day);
    }

    /** One summary for each yard week that has a day from `fromDay` up to but not on `toDay`, oldest first. */
    weekly(fromDay: number, toDay: number): WeekSummary[] {
        const out: WeekSummary[] = [];
        if (toDay <= fromDay) {
            return out;
        }
        const jobs = [...this.jobs.values()];
        for (let week = weekOf(fromDay); week < toDay; week += 7) {
            out.push(summariseWeek(jobs, week));
        }
        return out;
    }
}
