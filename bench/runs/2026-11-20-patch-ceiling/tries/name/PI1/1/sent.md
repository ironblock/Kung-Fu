I'm working on a small app in /home/dev/968025/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Tokens that are about to run out

The desk wants to warn a boater whose tokens will soon be worth nothing. Please add this function to `src/pumpout.ts`:

```ts
export function expiringSoon(wallet: Wallet, day: number, within: number): number
```

It returns how many of the wallet's tokens can be spent on `day` but can no longer be spent on day `day + within`.

A token can be spent from the day its batch was bought up to, but not on, the day `TOKEN_LIFE_DAYS` later. With a life of 180 days, a batch bought on day 100 is good on days 100 to 279 and dead on day 280. A batch bought after `day` cannot be spent on `day`, so none of its tokens count. A batch's `bought` is the day it was bought, and its `left` is the number of tokens still in it.

With a `within` of 0 the answer is 0. The wallet must not be changed.

Please keep every change inside /home/dev/968025/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/pumpout.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
