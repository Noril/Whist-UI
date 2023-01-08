// src/App.js

import { Client } from "boardgame.io/react";
import { Debug } from "boardgame.io/debug";
import { default as Whist } from "./Whist";
import { default as WhistBoard } from "./WhistBoard";
import { SocketIO } from "boardgame.io/multiplayer";

import { APP_PRODUCTION, WEB_SERVER_URL } from "./config";

const { protocol, hostname, port } = window.location;

let server = APP_PRODUCTION
  ? `${protocol}//${hostname}:${port}`
  : WEB_SERVER_URL;

const App = Client({
  game: Whist,
  numPlayers: 4,
  board: WhistBoard,
  multiplayer: SocketIO({ server }),
  debug: { impl: Debug },
});

export default App;
