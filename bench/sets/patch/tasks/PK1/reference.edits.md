EDIT: app/src/survey.ts
```
<<<<<<< SEARCH
=======

export function openBySeverity(findings: Finding[]): Record<Severity, number> {
    const tally: Record<Severity, number> = { advisory: 0, minor: 0, major: 0, critical: 0 };
    for (const finding of findings) {
        if (!finding.waived) {
            tally[finding.severity] += 1;
        }
    }
    return tally;
}
>>>>>>> REPLACE
```
