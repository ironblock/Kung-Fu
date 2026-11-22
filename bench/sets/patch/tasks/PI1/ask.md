# Tokens that are about to run out

The desk wants to warn a boater whose tokens will soon be worth nothing. Please add this function to `src/pumpout.ts`:

```ts
export function expiringSoon(wallet: Wallet, day: number, within: number): number
```

It returns how many of the wallet's tokens can be spent on `day` but can no longer be spent on day `day + within`.

A token can be spent from the day its batch was bought up to, but not on, the day `TOKEN_LIFE_DAYS` later. With a life of 180 days, a batch bought on day 100 is good on days 100 to 279 and dead on day 280. A batch bought after `day` cannot be spent on `day`, so none of its tokens count. A batch's `bought` is the day it was bought, and its `left` is the number of tokens still in it.

With a `within` of 0 the answer is 0. The wallet must not be changed.
