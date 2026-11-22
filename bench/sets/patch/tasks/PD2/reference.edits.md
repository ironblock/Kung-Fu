EDIT: app/src/fuel.ts
```
<<<<<<< SEARCH
    // A bill reads down the page in the order the draws were entered.
    const draws = drawsOf(ledger, boat).reverse();
    for (const draw of draws) {
        if (draw.day < fromDay || draw.day >= toDay) {
            continue;
        }
        const price = priceOn(prices, draw.day);
        if (price === NO_PRICE) {
            throw new Error(`no diesel price is set for day ${draw.day}`);
        }
        const pence = chargeFor(draw.volume, price);
        bill.lines.push({ day: draw.day, volume: draw.volume, price, pence });
        bill.volume += draw.volume;
        bill.total += pence;
    }
=======
    // A bill reads down the page in day order, with one line a day.
    const draws = drawsOf(ledger, boat).sort((a, b) => a.day - b.day);
    for (const draw of draws) {
        if (draw.day < fromDay || draw.day >= toDay) {
            continue;
        }
        const price = priceOn(prices, draw.day);
        if (price === NO_PRICE) {
            throw new Error(`no diesel price is set for day ${draw.day}`);
        }
        let line = bill.lines[bill.lines.length - 1];
        if (line === undefined || line.day !== draw.day) {
            line = { day: draw.day, volume: 0, price, pence: 0 };
            bill.lines.push(line);
        }
        // The day's draws are charged once, on their sum.
        bill.total -= line.pence;
        line.volume += draw.volume;
        line.pence = chargeFor(line.volume, price);
        bill.volume += draw.volume;
        bill.total += line.pence;
    }
>>>>>>> REPLACE
```
