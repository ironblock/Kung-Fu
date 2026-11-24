I'm working on a small app in /home/dev/4e6351/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Tokens that are about to run out

The desk wants to warn a boater whose tokens will soon be worth nothing. Please add this function to `src/pumpout.ts`:

```ts
export function expiringSoon(wallet: Wallet, day: number, within: number): number
```

It returns how many of the wallet's tokens can be spent on `day` but can no longer be spent on day `day + within`.

A token can be spent from the day its batch was bought up to, but not on, the day `TOKEN_LIFE_DAYS` later. With a life of 180 days, a batch bought on day 100 is good on days 100 to 279 and dead on day 280. A batch bought after `day` cannot be spent on `day`, so none of its tokens count. A batch's `bought` is the day it was bought, and its `left` is the number of tokens still in it.

With a `within` of 0 the answer is 0. The wallet must not be changed.

Please keep every change inside /home/dev/4e6351/app.

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

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
