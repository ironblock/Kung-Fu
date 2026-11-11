// Score keeping for the board game helpers.

function tally(points, bonus) { // @T01
  return points + bonus;
}

function tallyAll(rounds, bonus) {
  return rounds.map((points) => tally(points, bonus));
}

function settle(left, right) {
  return left - right;
}

function openRound() {
  function tally(points) {
    return points * 2;
  }
  return tally(4);
}

function weightedRound() {
  function tally(points, weight = 1) { // @T01
    return points * weight;
  }
  return tally(4, 3);
}

function longRound() {
  function tally(opening, ...others) { // @T01
    return others.reduce((sum, value) => sum + value, opening);
  }
  return tally(1, 2, 3);
}

function teamRound() {
  function tally(
    team,
    round,
    { home, away } // @T01
  ) {
    return `${team} ${round}: ${home}-${away}`;
  }
  return tally("reds", 2, { home: 1, away: 0 });
}

function spanRound() {
  function tally(title, [low, high]) { // @T01
    return `${title}: ${high - low}`;
  }
  return tally("spread", [2, 9]);
}

function pickedRound() {
  function tally(entries, pick = (entry, index) => entry.points + index) { // @T01
    function adjust(value, step) {
      return value + step;
    }
    const scale = (value, factor) => value * factor;
    return entries.map(pick).map((value) => scale(adjust(value, 1), 2));
  }
  return tally([{ points: 5 }]);
}

function emptyRound() {
  function tally() {
    return 0;
  }
  return tally();
}

function groupedRound() {
  function tally({ home, away }) {
    return home + away;
  }
  return tally({ home: 2, away: 2 });
}

function gatheredRound() {
  function tally(...entries) {
    return entries.length;
  }
  return tally(1, 2);
}

class Scoreboard {
  tally(points, bonus) {
    return points + bonus;
  }
}

const sheet = {
  tally(points, bonus) {
    return points * bonus;
  },
};

const fallback = function tally(points, bonus) {
  return points - bonus;
};

function arrowRound() {
  const tally = (points, bonus) => points + bonus;
  return tally(1, 2);
}
