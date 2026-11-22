I'm working on a small app in /home/dev/df2326/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# No visits over lunch

The pump-out point now shuts for lunch every day, from 12:30 up to but not including 13:10. The file keeps times as minutes from midnight, so that is from 750 up to but not including 790.

Please change `nextStart` in `src/pumpout.ts` so that it never gives a start whose visit would overlap the lunch closure. A visit may end exactly at 12:30, and a visit may start exactly at 13:10. A visit that would run into lunch is not cut short or split in two: the answer is the next start at which the whole visit fits, which may be after lunch, or the usual answer when there is none left that day.

Visits that are already in the log are left alone, and they block a start just as they do now, even one that sits inside the lunch closure. Everything else about the function stays as it is.

Please keep every change inside /home/dev/df2326/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/pumpout.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/pumpout.ts
  4: export type Service = "pumpout" | "water" | "both";
  6: export interface Visit {
  7:   boat: string
  8:   service: Service
  9:   day: number
 10:   start: number
 11:   slots: number
 13:   tokens: number
 14:   paidPence: number
 17: export interface Waiting {
 18:   boat: string
 19:   service: Service
 20:   since: number
 23: export interface TokenBatch {
 24:   bought: number
 25:   left: number
 28: export interface Wallet {
 29:   boat: string
 30:   batches: TokenBatch[]
 33: export interface Payment {
 34:   tokens: number
 35:   pence: number
 38: export const OPENS = 510;
 39: export const CLOSES = 1010;
 40: export const SLOT_MIN = 20;
 41: export const TOKEN_PENCE = 850;
 42: export const TOKEN_LIFE_DAYS = 180;
 43: export const NO_START = -1;
 45: SLOTS: Record<Service, number> = { pumpout: 2, water: 1, both: 3 }
 46: TOKENS: Record<Service, number> = { pumpout: 2, water: 1, both: 3 }
 48: DESK_PENCE: Record<Service, number> = { pumpout: 1900, water: 950, both: 2600 }
 51: export function lengthOf(service: Service): number {
 55: export function endOf(visit: Visit): number {
 59: export function clock(minutes: number): string {
 68: export function nextStart(log: Visit[], day: number, from: number, service: Service): number {
 85: export function joinQueue(queue: Waiting[], boat: string, service: Service, at: number): number {
 98: export function leaveQueue(queue: Waiting[], boat: string): boolean {
108: export function waitFor(queue: Waiting[], boat: string): number {
119: function isLive(batch: TokenBatch, day: number): boolean {
124: export function liveTokens(wallet: Wallet, day: number): number {
129: export function topUp(wallet: Wallet, count: number, day: number): number {
144: export function spend(wallet: Wallet, count: number, day: number): boolean {
162: export function settle(wallet: Wallet | undefined, service: Service, day: number): Payment {
170: export function record(log: Visit[], visit: Visit): void {
174: export function visitsOf(log: Visit[], boat: string): Visit[] {
179: export function takings(log: Visit[], day: number): number {
184: export function serve(queue: Waiting[], log: Visit[], wallets: Wallet[], day: number): Visit | undefined {
```

Lines 67 to 82 of the file, as they are:

```ts
/** The first start at or after `from` at which the service fits on that day, or NO_START. */
export function nextStart(log: Visit[], day: number, from: number, service: Service): number {
    const need = lengthOf(service) * SLOT_MIN;
    const taken = log.filter((v) => v.day === day);
    // Starts sit on the slot grid, which is counted from opening time.
    let start = OPENS + Math.max(0, Math.ceil((from - OPENS) / SLOT_MIN)) * SLOT_MIN;
    while (start + need <= CLOSES) {
        const end = start + need;
        // A visit holds the point from its start up to, not including, its end.
        if (!taken.some((v) => v.start < end && start < endOf(v))) {
            return start;
        }
        start += SLOT_MIN;
    }
    return NO_START;
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
