EDIT: app/src/moorings.ts
```
<<<<<<< SEARCH
    if (release(berths, boat.id, day, log) === "") return false;
    return assign(berths, boat, toId, day, log);
=======
    const from = berthOf(berths, boat.id);
    if (!from) return false;
    from.boatId = "";
    target.boatId = boat.id;
    log.unshift({ day, boatId: boat.id, from: from.id, to: target.id });
    return true;
>>>>>>> REPLACE
```
