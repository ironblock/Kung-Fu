I'm working on a small app in /home/dev/b34a52/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Count the standing findings by severity

I need a tally for the footer of the survey sheet. Please add this function to `src/survey.ts`:

```ts
export function openBySeverity(findings: Finding[]): Record<Severity, number>
```

It counts the findings that are not waived, each under its own severity. The result has the four severities as its keys, and no other key, with 0 for a severity that no such finding has. It must leave the array, and the findings in it, as they were.

Please keep every change inside /home/dev/b34a52/app.
