I'm working on a small app in /home/dev/beb363/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A free replacement pack must not make a part cheaper

When a supplier replaces faulty packs free of charge, we book the delivery with a pack price of 0. At the moment that drags the part's average price down, and the next jobs are charged too little for it.

Please change `PartsStore.receive` in `src/parts.ts` so that a delivery with a pack price of 0 leaves the part's average price exactly as it was, whether or not there is any of the part on the shelf.

Everything else about such a delivery stays as it is now: the units go on the shelf, the day of the last delivery is set, the movement is logged with a unit price of 0, and the units added are returned. A delivery that is refused now is still refused. A delivery with any price above 0 is averaged in as it is now, over all the units on the shelf.

Please keep every change inside /home/dev/beb363/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/parts.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/parts.ts
  7: export type MoveKind = "delivery" | "issue" | "return" | "count";
  9: export type Category = "engine" | "electrical" | "gas" | "plumbing" | "hull" | "general";
 12: export const NO_JOB = "";
 15: export const NO_BIN = "";
 18: export const NEVER = 0;
 21: export const DEFAULT_LEAD_DAYS = 7;
 24: export const NO_LIMIT = -1;
 27: export const USAGE_WEEKS = 4;
 29: PART_NO_SHAPE = /^[A-Z]{3}-\d{4}$/
 31: CATEGORY_OF_PREFIX: Record<string, Category> = {
 40: COUNT_EVERY: Record<Category, number> = {
 50: LEAD_DAYS: Record<string, number> = {
 57: export interface Part {
 58:   partNo: string
 59:   name: string
 60:   bin: string
 61:   packSize: number
 62:   reorderAt: number
 63:   reorderUpTo: number
 64:   supplier: string
 67: export interface StockLine {
 68:   onHand: number
 69:   avgPence: number
 70:   countedDay: number
 71:   deliveredDay: number
 74: export interface Hold {
 75:   partNo: string
 76:   jobId: string
 77:   units: number
 78:   day: number
 81: export interface Movement {
 82:   partNo: string
 83:   kind: MoveKind
 84:   units: number
 85:   day: number
 86:   jobId: string
 87:   unitPence: number
 90: export interface DeliveryLine {
 91:   partNo: string
 92:   packs: number
 93:   packPence: number
 96: export interface CountLine {
 97:   partNo: string
 98:   counted: number
101: export interface KitLine {
102:   partNo: string
103:   units: number
106: export interface ReorderLine {
107:   partNo: string
108:   supplier: string
109:   packs: number
110:   units: number
111:   dueDay: number
114: export interface PickLine {
115:   partNo: string
116:   bin: string
117:   units: number
120: export interface Variance {
121:   partNo: string
122:   before: number
123:   counted: number
124:   pence: number
127: function byText(a: string, b: string): number {
132: function inDays(day: number, fromDay: number, toDay: number): boolean {
136: function wholeAndAtLeast(value: number, least: number): boolean {
141: export function keyOf(raw: string): string {
145: export function isPartNo(raw: string): boolean {
149: export function categoryOf(partNo: string): Category {
154: export function packsFor(units: number, packSize: number): number {
162: export function reorderPacks(part: Part, free: number): number {
170: export function formatPence(pence: number): string {
179: export function sortByBin(parts: Part[]): Part[] {
192: export function shelfLabel(part: Part): string {
197: export function deliveryTotal(lines: DeliveryLine[]): number {
206: export function mergeKit(lines: KitLine[]): KitLine[] {
223: export function leadDaysOf(supplier: string): number {
228: export function expectedDay(supplier: string, orderedDay: number): number {
235: export function daysOfCover(free: number, perWeek: number): number {
245: export function describeMove(move: Movement): string {
252: export class PartsStore {
253:   private parts = new Map<string, Part>()
254:   private stock = new Map<string, StockLine>()
255:   private holds: Hold[] = []
256:   private moves: Movement[] = []
259:   addPart(part: Part): string {
281:   part(partNo: string): Part | undefined {
286:   partNos(): string[] {
291:   shelve(partNo: string, bin: string): string {
298:   onHand(partNo: string): number {
302:   held(partNo: string): number {
313:   heldFor(partNo: string, jobId: string): number {
318:   freeOf(partNo: string): number {
322:   avgPence(partNo: string): number {
326:   lastCounted(partNo: string): number {
330:   lastDelivered(partNo: string): number {
335:   receive(partNo: string, packs: number, packPence: number, day: number): number {
355:   receiveAll(lines: DeliveryLine[], day: number): number {
369:   setAside(partNo: string, units: number, jobId: string, day: number): number {
392:   setAsideKit(jobId: string, lines: KitLine[], day: number): KitLine[] {
408:   release(jobId: string): number {
422:   holdsFor(jobId: string): Hold[] {
427:   moveHold(partNo: string, fromJob: string, toJob: string): number {
445:   pickList(jobId: string): PickLine[] {
456:   issue(partNo: string, units: number, jobId: string, day: number): number {
480:   giveBack(partNo: string, units: number, jobId: string, day: number): void {
491:   correct(partNo: string, counted: number, day: number): number {
521:   stocktake(lines: CountLine[], day: number): Variance[] {
540:   needsReorder(partNo: string): boolean {
546:   reorderList(day: number): ReorderLine[] {
558:   history(partNo: string): Movement[] {
564:   movesBetween(fromDay: number, toDay: number): Movement[] {
570:   usage(partNo: string, fromDay: number, toDay: number): number {
585:   coverOf(partNo: string, day: number): number {
590:   stockValue(): number {
598:   valueByCategory(): Record<Category, number> {
607:   slowMovers(day: number, days: number): string[] {
623:   dueForCount(day: number): string[] {
634:   private known(partNo: string): Part {
642:   private lineOf(key: string): StockLine {
650:   private log(move: Movement): void {
```

Lines 334 to 352 of the file, as they are:

```ts
    /** Takes a delivery onto the shelves. Returns the units added. */
    receive(partNo: string, packs: number, packPence: number, day: number): number {
        const part = this.known(partNo);
        const line = this.lineOf(part.partNo);
        if (!wholeAndAtLeast(packs, 1)) {
            throw new RangeError(`bad number of packs for ${part.partNo}: ${packs}`);
        }
        if (!wholeAndAtLeast(packPence, 0)) {
            throw new RangeError(`bad pack price for ${part.partNo}: ${packPence}`);
        }
        const units = packs * part.packSize;
        // the average of what is on the shelf and what has come in, to the nearest penny
        line.avgPence = Math.round((line.onHand * line.avgPence + packs * packPence) / (line.onHand + units));
        line.onHand += units;
        line.deliveredDay = day;
        const unitPence = Math.round(packPence / part.packSize);
        this.log({ partNo: part.partNo, kind: "delivery", units, day, jobId: NO_JOB, unitPence });
        return units;
    }
```

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
