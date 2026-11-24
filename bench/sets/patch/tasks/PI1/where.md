# PI1: where the change is, and how an answer goes wrong

**The right change.** A new exported function `expiringSoon(wallet, day, within)`. It adds up `left` over the batches that are good on `day` (`day >= bought` and `day < bought + TOKEN_LIFE_DAYS`) and dead on day `day + within` (`day + within >= bought + TOKEN_LIFE_DAYS`). It changes nothing.

**Where.** Anywhere at the top level of `src/pumpout.ts`. The reference adds it at the end of the file, after `serve`, with an edit whose SEARCH is empty. Nothing else in the file changes.

**What it needs.** `Wallet.batches`, `TokenBatch.bought`, `TokenBatch.left` and `TOKEN_LIFE_DAYS`. The outline shows all four. The rule for a token's life is in the body of `isLive` (lines 119 to 122), which the outline does not show. So the ask states the rule, with an example.

**What a wrong answer is likely to do.**

- Count a token as good on the day its life is up (`<=` where the rule has `<`). `hollow-edge.ts` does this.
- Leave out "bought after `day`", so that a batch from a later day counts. `hollow-future.ts` does this.
- Return `liveTokens(wallet, day) - liveTokens(wallet, day + within)`. A batch bought after `day` that is good on day `day + within` then counts against the answer. `hollow-difference.ts` does this. It fails one case only: "does not count a batch bought after the day that is good on the day looked ahead to".
- `hollow-clamp.ts` is `hollow-difference.ts` with the result kept at 0 or more. It fails the same one case.
- Change the wallet while counting: take out the batches already dead on `day`, take out the empty ones, or sort the batches in place. The module keeps a dead batch on purpose, for a refund. `hollow-dropdead.ts`, `hollow-dropempty.ts` and `hollow-sortinplace.ts` do these. Each fails one case only: "leaves a wallet as it was even when it is out of order and holds a dead batch and an empty one".
- Take the batches to be oldest first, and stop at the first one bought after `day`. The ask promises no order, and `topUp` makes a wallet out of order when a purchase is entered for an earlier day. `hollow-inorder.ts` does this. It fails one case only: "takes the batches in whatever order the wallet holds them". That case has no batch that is bought after `day` and good on day `day + within`, so `hollow-difference.ts` passes it.
- Write the whole file anew from the outline, and so lose what the bodies do. `hollow-lost.ts` stands for that: its `record` adds at the end of the log. It fails through `unchanged` only.
- Ten more files stand for the same, each with one other function a little changed. Each fails one case of `unchanged` only. `hollow-closing.ts`: `nextStart` will not let a visit end at closing time. `hollow-dashes.ts`: `clock` shows dashes for every time below 0. `hollow-wrap.ts`: `clock` wraps the hour at 24. `hollow-emptybatch.ts`: `topUp` of 0 tokens adds an empty batch. `hollow-askboth.ts`: `joinQueue` keeps one service when the boat asks again for "both". `hollow-skiphead.ts`: `serve` passes over a head that has no room. `hollow-recordcopy.ts`: `record` logs a copy. `hollow-offgrid.ts`: `nextStart` jumps to the end of a visit in the way. `hollow-sameday.ts`: `topUp` joins any batch bought that day, not only the last. `hollow-negative.ts`: `spend` refuses a count below 0. All but `hollow-closing.ts` are in the other two tasks of this file as well.

**A right answer written another way.** `isLive(batch, day) && !isLive(batch, day + within)` is right when `within` is 0 or more: `isLive` does what the ask says. The check asks nothing about a `within` below 0, and nothing about a batch with no tokens left beyond its adding 0.

**What the check cannot see.** The return type. An answer declared `: string` that returns the right number passes, since the grader runs vitest and not `tsc`.
