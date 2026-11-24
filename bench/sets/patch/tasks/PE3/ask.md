# A Sunday allowance on a shift's pay

I want to change `shiftPayPence` in `src/rota.ts`. We now pay an allowance of 1,250 pence for a shift that starts on a Sunday, on top of what the shift pays today. The allowance is the same whatever the shift's length and whatever the rate, and I want it added after the pay has been rounded. A night shift that starts on a Saturday and ends on the Sunday morning gets no allowance. One that starts on a Sunday and ends on the Monday morning gets it. A shift that starts on any other day must pay exactly what it pays today.
