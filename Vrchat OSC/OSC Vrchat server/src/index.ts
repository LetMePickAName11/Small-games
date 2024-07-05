//import { ChessGame } from "./game logic/chess/chess-game";
import { OSCVrChatGameLogic } from "./models/osc_vrchat_game_logic";
import { OSCVrChat } from "./magic box/osc-vrchat";
import { TexasHoldThem } from "./game logic/texas hold them/texas-hold-them-game";

const oscVrchat = new OSCVrChat((): OSCVrChatGameLogic => new TexasHoldThem());

if (oscVrchat !== undefined) {
  console.log("Started up");
}
else {
  console.log("Oh fuck");
}