You cannot open files or run anything from where you are. Here is what you have of app/src/stoppages.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/stoppages.ts
  6: export type NoticeKind = "closure" | "restriction";
  8: export type Cause = "works" | "breach" | "water" | "ice" | "event";
 10: export interface Stretch {
 11:   id: string
 12:   name: string
 14:   ends: [string, string]
 15:   furlongs: number
 16:   locks: number
 19: export type Network = Stretch[];
 21: export interface Notice {
 22:   ref: string
 23:   stretch: string
 24:   kind: NoticeKind
 25:   cause: Cause
 26:   from: number
 27:   to: number
 29:   passFrom: number
 30:   passTo: number
 33: export interface Register {
 34:   notices: Notice[]
 37: export interface Route {
 39:   start: string
 40:   stretches: string[]
 43: export interface Leg {
 44:   stretch: string
 45:   enters: string
 46:   leaves: string
 47:   minutes: number
 50: export interface Tally {
 51:   closures: number
 52:   restrictions: number
 53:   openEnded: number
 57: export const OPEN_ENDED = -1;
 59: export const NO_BLOCK = -1;
 61: export const NOT_TODAY = -1;
 63: DAY_MINUTES = 1440
 64: FURLONGS_PER_MILE = 8
 67: MINUTES_PER_MILE = 18
 68: MINUTES_PER_LOCK = 12
 71: ALLOWANCE_PERCENT = 60
 73: CAUSE_WORDS: Record<Cause, string> = {
 81: function clock(minute: number): string {
 86: function stretchOf(network: Network, id: string): Stretch {
 95: function farEnd(stretch: Stretch, junction: string): string {
105: function legMinutes(stretch: Stretch): number {
109: function over(notice: Notice, day: number): boolean {
113: function sharesDay(one: Notice, other: Notice): boolean {
119: export function newRegister(): Register {
123: export function issue(register: Register, notice: Notice): void {
139: export function lift(register: Register, ref: string, day: number): boolean {
151: export function prune(register: Register, day: number): number {
162: export function inForce(notice: Notice, day: number): boolean {
167: export function noticesFor(register: Register, stretch: string): Notice[] {
171: export function noticeOn(register: Register, stretch: string, day: number): Notice | undefined {
176: export function overruled(register: Register, notice: Notice): Notice[] {
184: export function isClosed(register: Register, stretch: string, day: number): boolean {
191: export function passage(register: Register, stretch: string, day: number): [number, number] {
202: export function canPass(register: Register, stretch: string, day: number, minute: number): boolean {
207: export function firstBlock(register: Register, route: Route, day: number): number {
216: export function routeOpen(register: Register, route: Route, day: number): boolean {
221: export function noticesAlong(register: Register, route: Route, day: number): Notice[] {
238: export function reopens(register: Register, stretch: string, day: number): number {
253: export function nextOpenDay(register: Register, route: Route, day: number): number {
271: export function tally(register: Register, day: number): Tally {
289: export function legsOf(network: Network, route: Route): Leg[] {
304: export function endOf(network: Network, route: Route): string {
309: export function routeFurlongs(network: Network, route: Route): number {
317: export function routeLocks(network: Network, route: Route): number {
325: export function cruisingMinutes(network: Network, route: Route): number {
331: export function formatDistance(furlongs: number): string {
341: export function describe(network: Network, notice: Notice): string {
358: export function throughBy(network: Network, register: Register, route: Route, day: number, setOff: number): number {
376: export function wayRound(network: Network, register: Register, route: Route, day: number): Route | null {
417: export function extraMinutes(network: Network, register: Register, route: Route, day: number): number {
425: export function daysLost(network: Network, register: Register, route: Route, startDay: number, nights: number): number {
436: export function allowance(dayRate: number, lost: number): number {
```

Lines 216 to 218 of the file, as they are:

```ts
export function routeOpen(register: Register, route: Route, day: number): boolean {
    return firstBlock(register, route, day) === NO_BLOCK;
}
```
