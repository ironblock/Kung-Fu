EDIT: app/src/rota.ts
```
<<<<<<< SEARCH
            shift.staffId = swap.toStaffId;
=======
            shift.staffId = swap.toStaffId;
            for (const other of this.swaps) {
                if (other !== swap && other.shiftId === swap.shiftId && other.status === "pending") {
                    other.status = "refused";
                    other.decidedAt = at;
                }
            }
>>>>>>> REPLACE
```
