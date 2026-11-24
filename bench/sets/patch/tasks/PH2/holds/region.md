You cannot open files or run anything from where you are. Here is what you have of app/src/manifest.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/manifest.ts
  4: export type Role = "skipper" | "crew" | "passenger";
  5: export type Stowage = "fore" | "aft" | "cabin" | "roof";
  6: export type AgeBand = "infant" | "child" | "adult";
  7: export type Severity = "error" | "warning";
  9: export type ProblemCode =
 26: export interface Leg {
 27:   from: string
 28:   to: string
 30:   day: number
 32:   departMin: number
 33:   distanceM: number
 34:   locks: number
 35:   swingBridges: number
 38: export interface Person {
 39:   id: string
 40:   surname: string
 41:   given: string
 42:   role: Role
 44:   age: number
 46:   weightKg: number
 47:   swimmer: boolean
 48:   boardLeg: number
 49:   leaveLeg: number
 52: export interface LoadItem {
 53:   label: string
 54:   unitKg: number
 55:   count: number
 56:   stowed: Stowage
 59: export interface BoatLimits {
 60:   cls: string
 61:   berths: number
 62:   maxPeople: number
 64:   maxLoadKg: number
 65:   maxRoofKg: number
 66:   lifejackets: number
 69: export interface LegTimes {
 70:   startMin: number
 71:   endMin: number
 74: export interface LegLoad {
 75:   peopleKg: number
 76:   gearKg: number
 77:   roofKg: number
 78:   totalKg: number
 81: export interface Problem {
 82:   code: ProblemCode
 83:   severity: Severity
 84:   leg: number
 85:   detail: string
 88: export interface Amendment {
 89:   by: string
 90:   text: string
 93: export interface Summary {
 94:   legs: number
 95:   cruisingMin: number
 96:   distanceM: number
 97:   locks: number
 98:   peakPeople: number
 99:   peakLoadKg: number
100:   guestPence: number
103: export interface ReadResult {
104:   manifest: Manifest
105:   rejected: number[]
109: export const TO_END = -1;
111: export const NO_LEG = -1;
113: export const NO_TIME = -1;
115: export const DAY_MIN = 24 * 60;
117: CRUISE_M_PER_MIN = 80
118: LOCK_MIN = 12
119: BRIDGE_MIN = 4
120: STEP_MIN = 5
122: FIRST_DEPART_MIN = 8 * 60
123: LAST_ARRIVE_MIN = 19 * 60 + 30
124: MAX_LEG_MIN = 6 * 60
126: INFANT_UNDER = 2
127: CHILD_UNDER = 12
128: SKIPPER_MIN_AGE = 18
130: STANDARD_KG: Record<AgeBand, number> = { infant: 12, child: 35, adult: 82 }
133: export const DAY_GUEST_PENCE = 650;
135: export const BOAT_CLASSES: Record<string, BoatLimits> = {
142: ROLE_RANK: Record<Role, number> = { skipper: 0, crew: 1, passenger: 2 }
144: SEVERITY: Record<ProblemCode, Severity> = {
162: PROBLEM_ORDER: ProblemCode[] = [
180: function squash(text: string): string {
184: function pad(text: string, width: number): string {
188: function two(n: number): string {
192: function compareText(a: string, b: string): number {
200: function wholeNumber(text: string): number {
204: function isRole(text: string): text is Role {
208: function isStowage(text: string): text is Stowage {
212: export function ageBand(age: number): AgeBand {
219: export function personWeightKg(p: Person): number {
227: export function isAboard(p: Person, legIndex: number): boolean {
235: export function headcount(people: Person[]): number {
241: export function tidyPerson(p: Person): Person {
252: export function comparePeople(a: Person, b: Person): number {
264: export function legMinutes(leg: Leg): number {
272: export function legTimes(legs: Leg[]): LegTimes[] {
279: export function parseClock(text: string): number {
289: export function formatClock(min: number): string {
298: export function formatStamp(min: number): string {
305: export function formatDuration(min: number): string {
314: export function formatDistance(metres: number): string {
322: export function formatPence(pence: number): string {
329: export function gearKg(load: LoadItem[], stowed?: Stowage): number {
340: export function legSpan(p: Person, legCount: number): string {
352: function parseLegSpan(text: string): { boardLeg: number; leaveLeg: number } | null {
379: export function parseLegLine(line: string): Leg | null {
407: export function parsePersonLine(line: string): Person | null {
436: export function parseLoadLine(line: string): LoadItem | null {
450: function compareProblems(a: Problem, b: Problem): number {
460: function problem(code: ProblemCode, leg: number, detail: string): Problem {
465: export function checkLegs(legs: Leg[]): Problem[] {
494: export class Manifest {
495:   readonly boatName: string
496:   readonly limits: BoatLimits
497:   private legs: Leg[] = []
498:   private people: Person[] = []
499:   private load: LoadItem[] = []
500:   private log: Amendment[] = []
502:   private sealer = ""
504:   constructor(boatName: string, cls: string) {
513:   get legCount(): number {
517:   isSealed(): boolean {
521:   sealedBy(): string {
525:   private mustBeDraft(): void {
532:   addLeg(leg: Leg): number {
541:   addPerson(person: Person): boolean {
551:   removePerson(id: string): boolean {
562:   addLoad(item: LoadItem): boolean {
578:   legList(): Leg[] {
582:   loadList(): LoadItem[] {
587:   roster(): Person[] {
592:   aboardOn(legIndex: number): Person[] {
599:   headcountOn(legIndex: number): number {
603:   loadOn(legIndex: number): LegLoad {
609:   private peopleProblems(): Problem[] {
623:   private legProblems(legIndex: number): Problem[] {
653:   problems(): Problem[] {
671:   amend(by: string, text: string): boolean {
681:   amendments(): Amendment[] {
687:   seal(by: string): boolean {
700:   reopen(by: string, reason: string): boolean {
714: export function guestPence(m: Manifest): number {
725: export function summarise(m: Manifest): Summary {
746: export function renderLegLine(leg: Leg, index: number, times: LegTimes): string {
759: export function renderPersonLine(p: Person, legCount: number): string {
766: export function renderLoadLine(item: LoadItem): string {
771: export function renderProblemLine(p: Problem): string {
778: export function renderManifest(m: Manifest): string {
830: export function readManifest(boatName: string, cls: string, text: string): ReadResult {
```

Lines 562 to 576 of the file, as they are:

```ts
    addLoad(item: LoadItem): boolean {
        this.mustBeDraft();
        if (!(item.count > 0) || !(item.unitKg >= 0)) {
            return false;
        }
        const label = squash(item.label);
        const same = this.load.find((l) => l.stowed === item.stowed && l.label.toLowerCase() === label.toLowerCase());
        if (same !== undefined) {
            // the same thing in the same place is one row, and the unit weight first given stands
            same.count += item.count;
        } else {
            this.load.push({ ...item, label });
        }
        return true;
    }
```
