import { PlayerView, Stage } from "boardgame.io/core";
import { Suits, Ranks, Combinations } from "./constants";
import { cardsToCenter, passTurn, whistPlay } from "./moves/cardPlayMoves";
import {
  relocateCards,
  clearStagingArea,
  sortStagingArea,
} from "./moves/cardAreaMoves";
import { compareCards } from "./moves/helper-functions/cardComparison";
const _ = require("lodash");

const Whist = {
  name: "whist",
  setup: setUp,
  moves: {
    relocateCards: relocateCards,
    clearStagingArea: clearStagingArea,
    cardsToCenter: cardsToCenter,
    passTurn: passTurn,
    whistPlay: whistPlay,
    sortStagingArea: sortStagingArea,
  },
  stages: {
    whist: { moves: { whistPlay } },
    notTurn: {
      moves: { relocateCards, clearStagingArea, sortStagingArea },
    },
  },
  turn: {
    order: {
      first: G => G.firstPlayer,
    },
    activePlayers: {
      currentPlayer: { stage: Stage.NULL },
      others: { stage: "notTurn" },
    },
  },
  playerView: PlayerView.STRIP_SECRETS,
  endIf: G => {
    if (G.winners.length === 3) {
      let w = G.winners.concat(
        ["0", "1", "2", "3"].filter(x => !G.winners.includes(x))
      );
      return { winners: w };
    }
  },
};

function setUp(ctx) {
  let deck = [];
  for (let suit of Suits) {
    for (let rank of Ranks) {
      deck.push({ suit: suit, rank: rank });
    }
  }

  const n = ctx.random.Die(4);
  for (let i = 1 + n; i > 0; i--) {
    deck = ctx.random.Shuffle(deck);
  }
  const chunkedDeck = _.chunk(deck, 13).map(x => x.sort(compareCards));

  const players = {};

  let firstPlayer;
  for (let i = 0; i < 4; i++) {
    if (_.find(chunkedDeck[i], { rank: "3", suit: "S" })) {
      firstPlayer = i;
    }
    players[i] = {
      hand: chunkedDeck[i],
      stagingArea: [],
    };
  }

  return {
    turnOrder: [0, 1, 2, 3],
    center: [],
    players: players,
    roundType: Combinations.ANY,
    winners: [],
    firstPlayer: firstPlayer,
    cardsLeft: { 0: 13, 1: 13, 2: 13, 3: 13 },
  };
}

export default Whist;
