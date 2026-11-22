EDIT: app/src/stoppages.ts
```
<<<<<<< SEARCH
export function tally(register: Register, day: number): Tally {
=======
export function closedDays(register: Register, route: Route, fromDay: number, toDay: number): number[] {
    const days: number[] = [];
    for (let day = fromDay; day < toDay; day++) {
        if (!routeOpen(register, route, day)) {
            days.push(day);
        }
    }
    return days;
}

export function tally(register: Register, day: number): Tally {
>>>>>>> REPLACE
```
