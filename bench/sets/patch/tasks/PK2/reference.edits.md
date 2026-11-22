EDIT: app/src/survey.ts
```
<<<<<<< SEARCH
    let majors = 0;
=======
    let majors = 0;
    let minors = 0;
>>>>>>> REPLACE
```

EDIT: app/src/survey.ts
```
<<<<<<< SEARCH
            majors += 1;
        }
=======
            majors += 1;
        }
        if (finding.severity === "minor") {
            minors += 1;
        }
>>>>>>> REPLACE
```

EDIT: app/src/survey.ts
```
<<<<<<< SEARCH
    if (majors > MAX_MAJORS) {
=======
    if (minors >= 5) {
        majors += 1;
    }
    if (majors > MAX_MAJORS) {
>>>>>>> REPLACE
```
