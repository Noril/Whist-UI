import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import StagingAreaButtons from "./buttons/StagingAreaButtons";
import PassButton from "./buttons/PassButton";
import PlayCardsButton from "./buttons/PlayCardsButton";
import WhistButton from "./buttons/WhistButton";

export default class Buttons extends PureComponent {
  render() {
    const currentPlayer = this.props.ctx.currentPlayer === this.props.playerID;
    const whist =
      this.props.ctx.activePlayers[this.props.ctx.currentPlayer] === "whist";
    const player = this.props.G.players[this.props.playerID];
    const playButton =
      currentPlayer && whist ? (
        <WhistButton
          player={player}
          roundType={this.props.G.roundType}
          center={this.props.G.center}
          whistPlay={this.props.moves.whistPlay}
        />
      ) : (
        <PlayCardsButton
          currentPlayer={this.props.ctx.currentPlayer}
          playerID={this.props.playerID}
          player={player}
          roundType={this.props.G.roundType}
          center={this.props.G.center}
          cardsToCenter={this.props.moves.cardsToCenter}
        />
      );
    const passButton =
      currentPlayer && !whist ? (
        <PassButton passTurn={this.props.moves.passTurn} />
      ) : (
        ""
      );
    return (
      <div>
        <div className="center-container">
          <StagingAreaButtons
            currentPlayer={this.props.ctx.currentPlayer}
            playerID={this.props.playerID}
            sortStagingArea={this.props.moves.sortStagingArea}
            clearStagingArea={this.props.moves.clearStagingArea}
          />
        </div>
        <div className="center-container">{playButton}</div>
        <div className="center-container">{passButton}</div>
      </div>
    );
  }
}

Buttons.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  playerID: PropTypes.string,
};
