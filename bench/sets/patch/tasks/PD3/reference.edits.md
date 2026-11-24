EDIT: app/src/fuel.ts
```
<<<<<<< SEARCH
    mustBeVolume(volume, "a draw");
=======
    mustBeVolume(volume, "a draw");
    // A draw straight after the same boat's draw that day is the same visit to the pump.
    const last = ledger.entries[0];
    if (last !== undefined && last.kind === "draw" && last.boat === boat && last.day === day) {
        last.volume += volume;
        return last;
    }
>>>>>>> REPLACE
```
