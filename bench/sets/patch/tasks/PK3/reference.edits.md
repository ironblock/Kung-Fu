EDIT: app/src/survey.ts
```
<<<<<<< SEARCH
    return `${boat}: ${what}`;
=======
    const left = cert.expires - today;
    return `${boat}: ${what}, ${left > 0 ? `${plural(left, "day")} left` : "lapsed"}`;
>>>>>>> REPLACE
```
