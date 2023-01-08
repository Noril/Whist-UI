// src/tests/cardsToCenter.test.js

import { Client } from "boardgame.io/client";
import { default as Whist } from "../Whist";
import { Combinations } from "../constants";

describe("winners", () => {
  let G;
  let ctx;
  let client;
  beforeEach(() => {
    client = Client({
      game: Whist,
      numPlayers: 4,
    });
    G = client.store.getState()["G"];
    G.players = {
      "0": {
        hand: [
          { suit: "C", rank: "2" },
          { suit: "D", rank: "2" },
        ],
        stagingArea: [],
      },
      "1": {
        hand: [{ suit: "H", rank: "K" }],
        stagingArea: [],
      },
      "2": {
        hand: [{ suit: "H", rank: "A" }],
        stagingArea: [],
      },
      "3": {
        hand: [{ suit: "H", rank: "2" }],
        stagingArea: [],
      },
    };
    G.cardsLeft = {
      "0": 2,
      "1": 1,
      "2": 1,
      "3": 1,
    };
    ctx = client.store.getState()["ctx"];
    ctx.currentPlayer = "0";
  });

  it("should be added to every time a player runs out of cards", () => {
    client.moves.passTurn();
    client.moves.relocateCards([{ rank: "K", suit: "H" }], "stagingArea");
    client.moves.relocateCards([], "hand");
    client.moves.cardsToCenter();

    G = client.store.getState()["G"];
    ctx = client.store.getState()["ctx"];
    expect(G.winners).toEqual(["1"]);
    expect(G.roundType).toEqual(Combinations.SINGLE);

    client.moves.relocateCards([{ rank: "A", suit: "H" }], "stagingArea");
    client.moves.relocateCards([], "hand");
    G = client.store.getState()["G"];
    client.moves.cardsToCenter();

    G = client.store.getState()["G"];
    ctx = client.store.getState()["ctx"];
    expect(G.winners).toEqual(["1", "2"]);
    expect(G.roundType).toEqual(Combinations.SINGLE);
  });

  it("should be added to even when the player is in whist", () => {
    client.moves.relocateCards([{ suit: "C", rank: "2" }], "stagingArea");
    client.moves.relocateCards([{ suit: "D", rank: "2" }], "hand");
    client.moves.cardsToCenter();
    client.moves.passTurn();
    client.moves.passTurn();
    client.moves.passTurn();

    let ctx = client.store.getState()["ctx"];
    expect(ctx.activePlayers[0]).toEqual("whist");

    client.moves.relocateCards([{ suit: "D", rank: "2" }], "stagingArea");
    client.moves.relocateCards([], "hand");
    client.moves.whistPlay();

    G = client.store.getState()["G"];
    ctx = client.store.getState()["ctx"];
    expect(G.winners).toEqual(["0"]);
    expect(G.roundType).toEqual(Combinations.ANY);
    expect(ctx.currentPlayer).toEqual("1");
  });

  describe("turn order", () => {
    let G;
    let ctx;
    let client;
    beforeEach(() => {
      client = Client({
        game: Whist,
        numPlayers: 4,
      });
      G = client.store.getState()["G"];
      G.players = {
        "0": {
          hand: [
            { suit: "H", rank: "4" },
            { suit: "C", rank: "K" },
            { suit: "H", rank: "2" },
          ],
          stagingArea: [],
        },
        "1": {
          hand: [{ suit: "H", rank: "K" }],
          stagingArea: [],
        },
        "2": {
          hand: [{ suit: "H", rank: "A" }],
          stagingArea: [],
        },
        "3": {
          hand: [
            { suit: "C", rank: "2" },
            { suit: "H", rank: "5" },
          ],
          stagingArea: [],
        },
      };
      G.cardsLeft = {
        "0": 3,
        "1": 1,
        "2": 1,
        "3": 2,
      };
      ctx = client.store.getState()["ctx"];
      ctx.currentPlayer = "0";
    });

    it("should skip players who have won", () => {
      client.moves.relocateCards([{ suit: "H", rank: "4" }], "stagingArea");
      client.moves.relocateCards(
        [
          { suit: "C", rank: "K" },
          { suit: "H", rank: "2" },
        ],
        "hand"
      );
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("1");
      G = client.store.getState()["G"];
      expect(G.cardsLeft["0"]).toEqual(2);

      client.moves.relocateCards([{ suit: "H", rank: "K" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.cardsToCenter();
      G = client.store.getState()["G"];
      expect(G.winners).toEqual(["1"]);
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");

      client.moves.relocateCards([{ suit: "H", rank: "A" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.cardsToCenter();
      G = client.store.getState()["G"];
      expect(G.winners).toEqual(["1", "2"]);
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("3");

      client.moves.relocateCards([{ suit: "C", rank: "2" }], "stagingArea");
      client.moves.relocateCards([{ suit: "H", rank: "5" }], "hand");
      client.moves.cardsToCenter();

      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("0");

      client.moves.relocateCards([{ suit: "H", rank: "2" }], "stagingArea");
      client.moves.relocateCards([{ suit: "C", rank: "K" }], "hand");
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("3");

      client.moves.passTurn();

      client.moves.relocateCards([{ suit: "C", rank: "K" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.cardsToCenter();

      G = client.store.getState()["G"];
      expect(G.winners).toEqual(["1", "2", "0"]);
      ctx = client.store.getState()["ctx"];
      expect(ctx.gameover).toEqual({ winners: ["1", "2", "0", "3"] });
    });

    it("should pass to the next player on if no clear next player", () => {
      client.moves.relocateCards([{ suit: "H", rank: "4" }], "stagingArea");
      client.moves.relocateCards(
        [
          { suit: "H", rank: "K" },
          { suit: "H", rank: "2" },
        ],
        "hand"
      );
      client.moves.cardsToCenter();

      client.moves.relocateCards([{ suit: "H", rank: "K" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.cardsToCenter();
      G = client.store.getState()["G"];
      expect(G.turnOrder).toEqual([0, "W", 2, 3]);

      client.moves.relocateCards([{ suit: "H", rank: "A" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.cardsToCenter();
      G = client.store.getState()["G"];
      expect(G.turnOrder).toEqual([0, null, "W", 3]);

      client.moves.passTurn(); // player 3 passes
      G = client.store.getState()["G"];
      expect(G.turnOrder).toEqual([0, null, "W", null]);
      client.moves.passTurn(); // player 1 passes
      ctx = client.store.getState()["ctx"];
      G = client.store.getState()["G"];
      expect(ctx.currentPlayer).toEqual("3");
      expect(G.turnOrder).toEqual([0, null, null, 3]);
    });

    it("should switch to a new round if winner finished in whist", () => {
      client.moves.relocateCards([{ suit: "H", rank: "4" }], "stagingArea");
      client.moves.relocateCards(
        [
          { suit: "H", rank: "K" },
          { suit: "H", rank: "2" },
        ],
        "hand"
      );
      client.moves.cardsToCenter();
      client.moves.passTurn();
      client.moves.passTurn();
      client.moves.passTurn();

      ctx = client.store.getState()["ctx"];
      expect(ctx.activePlayers[0]).toEqual("whist");

      client.moves.relocateCards([{ suit: "H", rank: "K" }], "stagingArea");
      client.moves.relocateCards([{ suit: "H", rank: "2" }], "hand");
      client.moves.whistPlay();
      ctx = client.store.getState()["ctx"];
      expect(ctx.activePlayers[0]).toEqual("whist");

      client.moves.relocateCards([{ suit: "H", rank: "2" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.whistPlay();

      ctx = client.store.getState()["ctx"];
      G = client.store.getState()["G"];
      expect(G.winners).toEqual(["0"]);
      expect(ctx.currentPlayer).toEqual("1");
      expect(G.roundType).toEqual(Combinations.ANY);
    });

    it("should give players an opportunity to beat the last card played otherwise", () => {
      client.moves.relocateCards([{ suit: "H", rank: "4" }], "stagingArea");
      client.moves.relocateCards(
        [
          { suit: "H", rank: "K" },
          { suit: "H", rank: "2" },
        ],
        "hand"
      );
      client.moves.cardsToCenter();
      client.moves.passTurn();
      client.moves.passTurn();
      client.moves.passTurn();

      ctx = client.store.getState()["ctx"];
      expect(ctx.activePlayers[0]).toEqual("whist");

      client.moves.relocateCards([{ suit: "H", rank: "2" }], "stagingArea");
      client.moves.relocateCards([{ suit: "H", rank: "K" }], "hand");
      client.moves.whistPlay();
      ctx = client.store.getState()["ctx"];
      expect(ctx.activePlayers[0]).toEqual("whist");

      client.moves.relocateCards([{ suit: "H", rank: "K" }], "stagingArea");
      client.moves.relocateCards([], "hand");
      client.moves.whistPlay();

      ctx = client.store.getState()["ctx"];
      G = client.store.getState()["G"];
      expect(G.winners).toEqual(["0"]);
      expect(ctx.currentPlayer).toEqual("1");
      expect(G.roundType).toEqual(Combinations.SINGLE);
    });
  });
});
