EDIT: app/src/stoppages.ts
```
<<<<<<< SEARCH
        line += " until further notice";
    }
=======
        line += " until further notice";
    } else {
        // The stretch is open again on `to`, so the day before it is the last day shut.
        line += `, last day ${notice.to - 1}`;
    }
>>>>>>> REPLACE
```
