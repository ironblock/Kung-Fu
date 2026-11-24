You cannot open files or run anything from where you are. Here is what you have of app/src/worklog.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/worklog.ts
  4: export type JobState = "reported" | "booked" | "started" | "waiting" | "done" | "signed" | "dropped";
  5: export type Priority = "routine" | "soon" | "urgent";
  6: export type Grade = "apprentice" | "fitter" | "engineer";
  8: export interface Move {
  9:   to: JobState
 10:   day: number
 11:   by: string
 14: export interface PartLine {
 15:   sku: string
 16:   qty: number
 17:   unitPence: number
 20: export interface TimeEntry {
 21:   day: number
 22:   startMin: number
 23:   endMin: number
 24:   fitter: string
 25:   grade: Grade
 28: export interface Job {
 29:   id: number
 30:   boatId: string
 31:   title: string
 32:   priority: Priority
 33:   state: JobState
 34:   openedDay: number
 35:   dueDay: number
 36:   closedDay: number
 37:   history: Move[]
 38:   parts: PartLine[]
 39:   time: TimeEntry[]
 42: export interface JobCost {
 43:   partsPence: number
 44:   handlingPence: number
 45:   labourMin: number
 46:   labourPence: number
 47:   totalPence: number
 50: export interface BoatSummary {
 51:   boatId: string
 52:   jobs: number
 53:   open: number
 54:   lastDay: number
 55:   partsPence: number
 56:   labourMin: number
 57:   labourPence: number
 60: export interface WeekSummary {
 61:   week: number
 62:   opened: number
 63:   closed: number
 64:   labourMin: number
 65:   labourPence: number
 66:   partsPence: number
 69: export const NO_DAY = -1;
 70: export const NO_JOB = 0;
 71: export const DAY_MIN = 1440;
 72: export const JOB_STATES: readonly JobState[] = [
 83: MOVES: Record<JobState, readonly JobState[]> = {
 94: RATE: Record<Grade, number> = {
100: BILLING_STEP_MIN = 15
101: HANDLING_PER_MILLE = 125
103: RANK: Record<Priority, number> = {
109: function boatKey(boatId: string): string {
113: function partKey(sku: string): string {
118: export function isOpen(state: JobState): boolean {
123: export function isFrozen(state: JobState): boolean {
127: export function canMove(from: JobState, to: JobState, priority: Priority = "routine"): boolean {
135: export function nextStates(from: JobState, priority: Priority = "routine"): JobState[] {
140: export function dueFor(priority: Priority, openedDay: number): number {
153: export function weekOf(day: number): number {
159: export function billedMinutes(entry: TimeEntry): number {
168: function entryPence(entry: TimeEntry): number {
172: export function labourMinutes(job: Job): number {
180: export function labourPence(job: Job): number {
188: export function partsCost(job: Job): number {
196: export function costOf(job: Job): JobCost {
212: export function addPart(job: Job, sku: string, qty: number, unitPence: number): boolean {
240: export function addTime(job: Job, entry: TimeEntry): boolean {
262: export function lateBy(job: Job, day: number): number {
271: export function sortJobs(jobs: Job[]): Job[] {
290: export function formatPence(pence: number): string {
298: export function jobLine(job: Job): string {
304: export function boatsOf(jobs: Job[]): string[] {
312: export function summariseBoat(jobs: Job[], boatId: string): BoatSummary {
341: export function summariseWeek(jobs: Job[], day: number): WeekSummary {
375: export class WorkLog {
376:   private jobs: Map<number, Job> = new Map()
377:   private nextId = 1
379:   get count(): number {
384:   open(boatId: string, title: string, priority: Priority, day: number, by: string): number {
409:   get(id: number): Job | undefined {
413:   move(id: number, to: JobState, day: number, by: string): boolean {
436:   logTime(id: number, entry: TimeEntry): boolean {
441:   usePart(id: number, sku: string, qty: number, unitPence: number): boolean {
447:   escalate(id: number, priority: Priority, day: number): boolean {
461:   openJobs(): Job[] {
466:   forBoat(boatId: string): Job[] {
472:   between(fromDay: number, toDay: number): Job[] {
476:   boatSummary(boatId: string): BoatSummary {
480:   weekSummary(day: number): WeekSummary {
485:   weekly(fromDay: number, toDay: number): WeekSummary[] {
```

Lines 413 to 434 of the file, as they are:

```ts
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
```
