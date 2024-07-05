import { Piece } from "chess.js";

export interface ChessInput {
  pieceFile: string;
  pieceRank: string;
  newPositionFile: string;
  newPositionRank: string;
  waitingForPromotionInput: boolean;
  promotionInput: number;
  selectedPosition: Piece | null;
  selectedPiece: Piece | null;
}