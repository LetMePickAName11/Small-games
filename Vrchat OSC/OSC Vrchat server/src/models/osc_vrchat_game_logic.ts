import { GameLogicResponse } from "./game_logic_response";

export interface OSCVrChatGameLogic {
  getState(): { [key in string]: number };
  handleInput(input: string): GameLogicResponse;
  debugInfo(): string;
}