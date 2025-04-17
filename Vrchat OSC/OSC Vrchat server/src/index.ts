import { ChessGame } from "./game logic/chess/chess-game";
import { OSCVrChatGameLogic } from "./models/osc_vrchat_game_logic";
import { OSCVrChat } from "./magic box/osc-vrchat";

// Factory function to create new instance. Name of the directory to get user_defined_data
const oscVrchat = new OSCVrChat((): OSCVrChatGameLogic => new ChessGame(), "chess");

if (oscVrchat !== undefined) {
  console.log("Started up");
}
else {
  console.log("Oh fuck");
}