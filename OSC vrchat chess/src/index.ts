import { ChessGame } from "./chess-game";
import { OSCVrChatGameLogic } from "./models/osc_vrchat_game_logic";
import { OSCVrChat } from "./osc-vrchat";

const oscVrchat = new OSCVrChat((): OSCVrChatGameLogic => new ChessGame());

if(oscVrchat !== undefined){
  console.log("Started up");
}
else {
  console.log("Oh fuck");
}