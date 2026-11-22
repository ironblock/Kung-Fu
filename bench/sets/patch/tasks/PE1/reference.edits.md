EDIT: app/src/rota.ts
```
<<<<<<< SEARCH
shiftsFor(staffId: string): Shift[] {
=======
openShifts(fromDay: number, toDay: number, role?: Role): Shift[] {
        const open = this.shifts.filter((s) => s.staffId === OPEN && s.day >= fromDay && s.day < toDay);
        const wanted = role === undefined ? open : open.filter((s) => s.role === role);
        return wanted.sort((a, b) => a.day - b.day || a.start - b.start);
    }

    shiftsFor(staffId: string): Shift[] {
>>>>>>> REPLACE
```
