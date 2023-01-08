// src/tests/turnOrder.test.js

import { Client } from "boardgame.io/client";
import { default as Whist } from "../Whist";
import { Combinations } from "../constants";

describe("Turn order", () => {
  let client;
  let ctx;

  beforeEach(() => {
    client = Client({
      game: Whist,
      numPlayers: 4,
    });
    ctx = client.store.getState()["ctx"];
    ctx.currentPlayer = "0";
  });

  it("should pass to the next player, wrapping around", () => {
    // pass turn along
    client.moves.relocateCards([{ rank: "3", suit: "C" }], "stagingArea");
    client.moves.cardsToCenter();

    let { ctx } = client.store.getState();

    expect(ctx.currentPlayer).toEqual("1");

    client.moves.relocateCards([{ rank: "4", suit: "C" }], "stagingArea");
    client.moves.cardsToCenter();
    ctx = client.store.getState()["ctx"];
    expect(ctx.currentPlayer).toEqual("2");

    client.moves.relocateCards([{ rank: "5", suit: "C" }], "stagingArea");
    client.moves.cardsToCenter();
    ctx = client.store.getState()["ctx"];
    expect(ctx.currentPlayer).toEqual("3");

    client.moves.relocateCards([{ rank: "6", suit: "C" }], "stagingArea");
    client.moves.cardsToCenter();
    ctx = client.store.getState()["ctx"];
    let G = client.store.getState()["G"];
    expect(ctx.currentPlayer).toEqual("0");
    expect(G.turnOrder).toEqual([0, 1, 2, 3]);
  });

  describe("skips", () => {
    let G;

    beforeEach(() => {
      G = client.store.getState()["G"];
      G.turnOrder = [0, null, 2, 3];
    });

    it("should skip any players who have passed", () => {
      client.moves.relocateCards([{ rank: "3", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();

      let { ctx } = client.store.getState();
      expect(ctx.currentPlayer).toEqual("2");

      client.moves.relocateCards([{ rank: "4", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("3");

      client.moves.relocateCards([{ rank: "5", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter(); // player 3 passes
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("0");

      client.moves.relocateCards([{ rank: "6", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      G = client.store.getState()["G"];
      expect(G.turnOrder).toEqual([0, null, 2, 3]);
    });

    it("should remove players who pass from the turn order", () => {
      client.moves.relocateCards([{ rank: "3", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();

      let { ctx } = client.store.getState();

      expect(ctx.currentPlayer).toEqual("2");

      client.moves.relocateCards([{ rank: "4", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("3");

      client.moves.passTurn(); // player 3 passes
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("0");

      client.moves.relocateCards([{ rank: "5", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");

      client.moves.relocateCards([{ rank: "6", suit: "C" }], "stagingArea");
      client.moves.cardsToCenter();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("0");
      G = client.store.getState()["G"];
      expect(G.turnOrder).toEqual([0, null, 2, null]);
    });
  });

  describe("whist", () => {
    let G;
    let ctx;

    beforeEach(() => {
      G = client.store.getState()["G"];
      ctx = client.store.getState()["ctx"];
      ctx.currentPlayer = "1";
      G.turnOrder = [null, 1, 2, null];
      G.center = [{ rank: "4", suit: "C" }];
      G.roundType = Combinations.SINGLE;
    });

    it("should start whenever 1 player is left in turn order", () => {
      client.moves.passTurn();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "whist",
        "3": "notTurn",
      });
    });

    it("should persist as long as the player makes whist moves", () => {
      client.moves.passTurn();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "whist",
        "3": "notTurn",
      });

      client.moves.relocateCards([{ rank: "4", suit: "D" }], "stagingArea");
      client.moves.whistPlay();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "whist",
        "3": "notTurn",
      });

      client.moves.relocateCards([{ rank: "4", suit: "H" }], "stagingArea");
      client.moves.whistPlay();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "whist",
        "3": "notTurn",
      });
    });

    it("should end when the player makes a non-whist move", () => {
      client.moves.passTurn();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "whist",
        "3": "notTurn",
      });

      client.moves.relocateCards([{ rank: "4", suit: "D" }], "stagingArea");
      client.moves.whistPlay();
      ctx = client.store.getState()["ctx"];
      expect(ctx.currentPlayer).toEqual("2");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "whist",
        "3": "notTurn",
      });

      client.moves.relocateCards([{ rank: "4", suit: "S" }], "stagingArea");
      client.moves.whistPlay();
      ctx = client.store.getState()["ctx"];
      G = client.store.getState()["G"];
      expect(ctx.currentPlayer).toEqual("3");
      expect(ctx.activePlayers).toEqual({
        "0": "notTurn",
        "1": "notTurn",
        "2": "notTurn",
        "3": null,
      });
      expect(G.turnOrder).toEqual([0, 1, 2, 3]);
    });
  });
});
