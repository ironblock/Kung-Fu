EDIT: app/src/pumpout.ts
```
<<<<<<< SEARCH
=======

/** How many of the wallet's tokens can be spent on `day` and no longer on day `day + within`. */
export function expiringSoon(wallet: Wallet, day: number, within: number): number {
    let count = 0;
    for (const batch of wallet.batches) {
        const dead = batch.bought + TOKEN_LIFE_DAYS;
        if (day >= batch.bought && day < dead && day + within >= dead) {
            count += batch.left;
        }
    }
    return count;
}
>>>>>>> REPLACE
```
