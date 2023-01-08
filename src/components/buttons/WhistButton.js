import React from "react";
import PropTypes from "prop-types";
import {
  validCombination,
  validChop,
  compareHighest,
} from "../../moves/helper-functions/cardComparison";

export default function WhistButton({
  player,
  roundType,
  center,
  whistPlay,
}) {
  let stagingArea = player.stagingArea;
  const handType = validCombination(stagingArea);
  let classList;
  let text = "Whist - ";
  const invalidPlay =
    stagingArea.length === 0 || validCombination(stagingArea) === undefined;
  if (invalidPlay) {
    text += "Invalid Combination";
    classList = "disabled";
  } else if (validChop(center, stagingArea)) {
    text += "Whist";
    classList = "whist";
  } else if (
    roundType !== handType ||
    compareHighest(stagingArea, center) !== 1 ||
    stagingArea.length !== center.length
  ) {
    text += stagingArea.length === 1 ? "Play Card" : "Play Cards";
  } else {
    text += "Whist";
    classList = "whist";
  }
  return (
    <button
      className={classList}
      disabled={invalidPlay}
      key="whistPlay"
      onClick={invalidPlay ? () => null : () => whistPlay()}
    >
      {text}
    </button>
  );
}

WhistButton.propTypes = {
  player: PropTypes.object,
  roundType: PropTypes.string,
  center: PropTypes.array,
  whistPlay: PropTypes.func,
};
