EDIT: app/src/tides.ts
```
<<<<<<< SEARCH
        if (window.opens < start) pieces.push({ ...window, closes: start });
        if (end < window.closes) pieces.push({ ...window, opens: end });
=======
        if (start - window.opens >= LOCKING) pieces.push({ ...window, closes: start });
        else lost += start - window.opens;
        if (window.closes - end >= LOCKING) pieces.push({ ...window, opens: end });
        else lost += window.closes - end;
>>>>>>> REPLACE
```
