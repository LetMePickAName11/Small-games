import { Chess, Square } from "chess.js";
import { ChessIndexName } from "./models/enums";
import { OSCVrChatGameLogic } from "./models/osc_vrchat_game_logic";
import { GameLogicResponse } from "./models/game_logic_response";
import { ChessInput } from "./models/chess_input";

export class ChessGame implements OSCVrChatGameLogic {
  public getState(): { [key in string]: number } {
    const res = {
      Pawn_White_1_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_1']),
      Pawn_White_2_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_2']),
      Pawn_White_3_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_3']),
      Pawn_White_4_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_4']),
      Pawn_White_5_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_5']),
      Pawn_White_6_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_6']),
      Pawn_White_7_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_7']),
      Pawn_White_8_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_White_8']),
      Pawn_Black_1_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_1']),
      Pawn_Black_2_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_2']),
      Pawn_Black_3_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_3']),
      Pawn_Black_4_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_4']),
      Pawn_Black_5_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_5']),
      Pawn_Black_6_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_6']),
      Pawn_Black_7_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_7']),
      Pawn_Black_8_Promotion: this.getPawnPromotion(ChessIndexName['Pawn_Black_8']),
      Pawn_White_1_Position: this.getPiecePosition(ChessIndexName['Pawn_White_1']),
      Pawn_White_2_Position: this.getPiecePosition(ChessIndexName['Pawn_White_2']),
      Pawn_White_3_Position: this.getPiecePosition(ChessIndexName['Pawn_White_3']),
      Pawn_White_4_Position: this.getPiecePosition(ChessIndexName['Pawn_White_4']),
      Pawn_White_5_Position: this.getPiecePosition(ChessIndexName['Pawn_White_5']),
      Pawn_White_6_Position: this.getPiecePosition(ChessIndexName['Pawn_White_6']),
      Pawn_White_7_Position: this.getPiecePosition(ChessIndexName['Pawn_White_7']),
      Pawn_White_8_Position: this.getPiecePosition(ChessIndexName['Pawn_White_8']),
      Pawn_Black_1_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_1']),
      Pawn_Black_2_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_2']),
      Pawn_Black_3_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_3']),
      Pawn_Black_4_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_4']),
      Pawn_Black_5_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_5']),
      Pawn_Black_6_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_6']),
      Pawn_Black_7_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_7']),
      Pawn_Black_8_Position: this.getPiecePosition(ChessIndexName['Pawn_Black_8']),
      Rook_White_1_Position: this.getPiecePosition(ChessIndexName['Rook_White_1']),
      Rook_White_2_Position: this.getPiecePosition(ChessIndexName['Rook_White_2']),
      Rook_Black_1_Position: this.getPiecePosition(ChessIndexName['Rook_Black_1']),
      Rook_Black_2_Position: this.getPiecePosition(ChessIndexName['Rook_Black_2']),
      Bishop_White_1_PositionBishop: this.getPiecePositionBishop(ChessIndexName['Bishop_White_1'], true),
      Bishop_White_2_PositionBishop: this.getPiecePositionBishop(ChessIndexName['Bishop_White_2'], false),
      Bishop_Black_1_PositionBishop: this.getPiecePositionBishop(ChessIndexName['Bishop_Black_1'], true),
      Bishop_Black_2_PositionBishop: this.getPiecePositionBishop(ChessIndexName['Bishop_Black_2'], false),
      Knight_White_1_Position: this.getPiecePosition(ChessIndexName['Knight_White_1']),
      Knight_White_2_Position: this.getPiecePosition(ChessIndexName['Knight_White_2']),
      Knight_Black_1_Position: this.getPiecePosition(ChessIndexName['Knight_Black_1']),
      Knight_Black_2_Position: this.getPiecePosition(ChessIndexName['Knight_Black_2']),
      Queen_White_1_Position: this.getPiecePosition(ChessIndexName['Queen_White_1']),
      King_White_1_Position: this.getPiecePosition(ChessIndexName['King_White_1']),
      Queen_Black_1_Position: this.getPiecePosition(ChessIndexName['Queen_Black_1']),
      King_Black_1_Position: this.getPiecePosition(ChessIndexName['King_Black_1']),
      Rook_White_Both_Captured: this.getPieceTypeCaptured(ChessIndexName['Rook_White_1']),
      Rook_Black_Both_Captured: this.getPieceTypeCaptured(ChessIndexName['Rook_Black_1']),
      Bishop_White_Both_Captured: this.getPieceTypeCaptured(ChessIndexName['Bishop_White_1']),
      Bishop_Black_Both_Captured: this.getPieceTypeCaptured(ChessIndexName['Bishop_Black_1']),
      Knight_White_Both_Captured: this.getPieceTypeCaptured(ChessIndexName['Knight_White_1']),
      Knight_Black_Both_Captured: this.getPieceTypeCaptured(ChessIndexName['Knight_Black_1']),
      Queen_White_1_Captured: this.getPieceTypeCaptured(ChessIndexName['Queen_White_1']),
      Queen_Black_1_Captured: this.getPieceTypeCaptured(ChessIndexName['Queen_Black_1']),
      Selected_Piece: this.getSelectedPieceBit(),
      Selected_Position: this.getSelectedPositionBit(),
      Selected_Piece_Shown: this.getSelectedPieceShown(),
      Selected_Position_Shown: this.getSelectedPositionShown()
    };

    return res;
  }

  public handleInput(inputString: string): GameLogicResponse {
    // get the input index from input string.
    // f.x. Input_1 -> 1 or Input_6 -> 6.
    const inputNumber: number = Number(inputString.split('_')[1]);

    // if waitingForPromotionInput flag is true set the promotion input
    if (this.input.waitingForPromotionInput) {
      this.input.promotionInput = inputNumber;
      return this.attemptMove();
    }

    // If first input; set the selected piece file and return false
    if (this.input.pieceFile === '') {
      this.input.pieceFile = String.fromCharCode(inputNumber + 96);
      return { updateVrc: false, message: null };
    }
    // If second input; set the selected rank, selected piece, check if you are allowed to move piece otherwise reset input and return false regardless of outcome
    if (this.input.pieceRank === '') {
      this.input.pieceRank = `${inputNumber}`;
      this.input.selectedPiece = this.chess.get(this.getSelectedPiece());
      // If no piece was selected or it is the other persons piece. Then reset input
      if (this.input.selectedPiece === null || this.chess.turn() !== this.input.selectedPiece.color) {
        this.resetInput();
        return { updateVrc: false, message: "Invalid piece selected." };
      }
      return { updateVrc: true, message: null };
    }

    // If third input; set the selected new position file and return false
    if (this.input.newPositionFile === '') {
      this.input.newPositionFile = String.fromCharCode(inputNumber + 96);
      return { updateVrc: false, message: null };
    }
    // If fourth input; set the selected new position rank, selected position and continue
    if (this.input.newPositionRank === '') {
      this.input.newPositionRank = `${inputNumber}`;
      this.input.selectedPosition = this.chess.get(this.getSelectedPosition());

      // If selected piece and position is the same. Reset input
      if (this.input.pieceFile === this.input.newPositionFile && this.input.pieceRank === this.input.newPositionRank) {
        this.resetInput();
        return { updateVrc: false, message: 'Selected same position as piece, input reset.' };
      }
    }


    return this.attemptMove();
  }

  public debugInfo(): string {
    return this.chess.ascii();
  }



  private attemptMove(): GameLogicResponse {
    try {
      if (this.input.selectedPiece?.type === 'p' && (this.input.newPositionRank === '1' || this.input.newPositionRank === '8') && this.chess.moves({ square: this.getSelectedPiece() }).length !== 0 && this.input.promotionInput === -1) {
        this.input.waitingForPromotionInput = true;
        return { updateVrc: false, message: 'Please select a piece to promote to.' };
      }

      // Will throw an error is invalid move
      const promotion: string = this.getPromotionMove();
      this.chess.move({ from: this.getSelectedPiece<string>(), to: this.getSelectedPosition<string>(), promotion: promotion });
      const potentialCapturedPiece: [ChessIndexName, Square] | undefined = [...this.alivePieces].find(([_key, val]: [ChessIndexName, Square]) => val == this.getSelectedPosition());
      const movedPiece: [ChessIndexName, Square] | undefined = [...this.alivePieces].find(([_key, val]: [ChessIndexName, Square]) => val == this.getSelectedPiece());

      if (movedPiece === undefined) {
        throw new Error(`private attemptMove() moved piece is null something fucked up big time`);
      }

      if (potentialCapturedPiece !== undefined) {
        // Only time this will be a valid move is when castling
        if (this.chess.get(this.getSelectedPiece()).color === this.chess.get(this.getSelectedPosition()).color) {
          this.alivePieces.set(movedPiece[0], potentialCapturedPiece[1]);
          this.alivePieces.set(potentialCapturedPiece[0], movedPiece[1]);
        } // else remove the captured piece and set the selected piece position to the caputured
        else {
          this.alivePieces.delete(potentialCapturedPiece[0]);
          this.alivePieces.set(movedPiece[0], potentialCapturedPiece[1]);
        }
      }
      else {
        this.alivePieces.set(movedPiece[0], this.getSelectedPosition());
      }

      if (promotion !== undefined) {
        this.pawnPromotions.set(movedPiece[0], this.pawnPromotionMap.get(promotion)!);
      }
    } catch {
      // Simply reset input and display invalid move
      this.resetInput();
      return { updateVrc: false, message: 'Invalid move.' };
    }
    const message: string = this.generateChessMoveText();
    this.resetInput();
    return { updateVrc: true, message: message };
  }

  private getSelectedPiece<t>(): t {
    return `${this.input.pieceFile}${this.input.pieceRank}` as t
  }

  private getSelectedPosition<t>(): t {
    return `${this.input.newPositionFile}${this.input.newPositionRank}` as t
  }

  private chessSquareToIndex(square: Square): number {
    const [squareFile, squareRank] = square;
    if (squareFile === undefined || squareRank === undefined) {
      return 0;
    }

    const file = squareFile.charCodeAt(0) - 'a'.charCodeAt(0); // Calculates file index: 'a' -> 0, 'b' -> 1, ..., 'h' -> 7
    const rank = parseInt(squareRank) - 1; // Converts rank to 0-based index: '1' -> 0, '2' -> 1, ..., '8' -> 7
    return rank * 8 + file;
  }

  private chessSquareToIndexBishop(square: Square, isWhiteSquare: boolean): number {
    const [squareFile, squareRank] = square;
    if (squareFile === undefined || squareRank === undefined) {
      return 0;
    }

    const file = squareFile.charCodeAt(0) - 'a'.charCodeAt(0); // Calculates file index: 'a' -> 0, 'b' -> 1, ..., 'h' -> 7
    const rank = parseInt(squareRank) - 1; // Converts rank to 0-based index: '1' -> 0, '2' -> 1, ..., '8' -> 7
    const index = rank * 8 + file;

    // Ensure index is valid for bishops on either black or white squares
    if (isWhiteSquare && (index % 2 !== 0)) {
      throw new Error("Invalid square for white bishop");
    } else if (!isWhiteSquare && (index % 2 !== 1)) {
      throw new Error("Invalid square for black bishop");
    }

    // Return 5-bit integer representation (0-31)
    return Math.floor(index / 2);
  }

  private getPromotionMove(): string {
    switch (this.input.promotionInput) {
      case 1:
        return 'n';
      case 2:
        return 'q';
    }

    return undefined!;
  }

  private resetInput(): void {
    this.input.pieceFile = '';
    this.input.pieceRank = '';
    this.input.newPositionFile = '';
    this.input.newPositionRank = '';
    this.input.waitingForPromotionInput = false;
    this.input.promotionInput = -1;
    this.input.selectedPosition = null;
    this.input.selectedPiece = null;
  }

  private generateChessMoveText(): string {
    let res = '';
    res += `${this.getSelectedPiece()} -> ${this.getSelectedPosition()}.`;

    if (this.chess.isCheck()) {
      res += ' Check.';
    }
    else if (this.chess.isCheckmate()) {
      res += ' Check mate.'
    }
    else if (this.chess.isThreefoldRepetition()) {
      res += ' Three fold repetition.'
    }
    else if (this.chess.isInsufficientMaterial()) {
      res += ' Insufficient material.'
    }
    else if (this.chess.isDraw()) {
      res += ' Draw.'
    } // Add fifty move rule

    return res;
  }

  private getPawnPromotion(pawnName: ChessIndexName): number {
    return this.alivePieces.has(pawnName) ? this.pawnPromotions.get(pawnName)! : 0;
  }

  private getPiecePosition(pieceName: ChessIndexName): number {
    const pieceSquare: Square = this.alivePieces.get(pieceName)! || this.alivePieces.get(this.twinMap.get(pieceName)!)! || this.alivePieces.get(this.kingMap.get(pieceName)!)!;
    return this.chessSquareToIndex(pieceSquare);
  }

  private getPiecePositionBishop(pieceName: ChessIndexName, isWhiteSquare: boolean): number {
    const pieceSquare: Square = this.alivePieces.get(pieceName)! || this.alivePieces.get(this.twinMap.get(pieceName)!)! || this.alivePieces.get(this.kingMap.get(pieceName)!)!;
    return this.chessSquareToIndexBishop(pieceSquare, isWhiteSquare);
  }

  private getPieceTypeCaptured(pieceType: ChessIndexName): number {
    return (this.alivePieces.has(pieceType)! || this.alivePieces.has(this.twinMap.get(pieceType)!)!) ? 0 : 1;
  }

  private getSelectedPieceBit(): number {
    if (this.input.selectedPiece === null) {
      return 0;
    }

    const chessIndexName: ChessIndexName = [...this.alivePieces].find(([_key, val]) => val === this.getSelectedPiece<Square>())?.[0]!;
    return this.pieceIndexMap.get(chessIndexName)!;
  }

  private getSelectedPositionBit(): number {
    if (this.input.selectedPosition === null) {
      return 0;
    }
  
    const square: Square = this.getSelectedPosition<Square>();
    return this.chessSquareToIndex(square);
  }

  private getSelectedPieceShown(): number {
    return Number(this.input.selectedPiece !== null);
  }

  private getSelectedPositionShown(): number {
    return Number(this.input.selectedPosition !== null);
  }


  private readonly input: ChessInput = {
    pieceFile: '',
    pieceRank: '',
    newPositionFile: '',
    newPositionRank: '',
    waitingForPromotionInput: false,
    promotionInput: -1,
    selectedPosition: null,
    selectedPiece: null,
  };
  private readonly chess: Chess = new Chess();
  private readonly alivePieces: Map<ChessIndexName, Square> = new Map<ChessIndexName, Square>([
    [ChessIndexName.Rook_White_1, 'a1'],
    [ChessIndexName.Knight_White_1, 'b1'],
    [ChessIndexName.Bishop_White_1, 'c1'],
    [ChessIndexName.Queen_White_1, 'd1'],
    [ChessIndexName.King_White_1, 'e1'],
    [ChessIndexName.Bishop_White_2, 'f1'],
    [ChessIndexName.Knight_White_2, 'g1'],
    [ChessIndexName.Rook_White_2, 'h1'],
    [ChessIndexName.Pawn_White_1, 'a2'],
    [ChessIndexName.Pawn_White_2, 'b2'],
    [ChessIndexName.Pawn_White_3, 'c2'],
    [ChessIndexName.Pawn_White_4, 'd2'],
    [ChessIndexName.Pawn_White_5, 'e2'],
    [ChessIndexName.Pawn_White_6, 'f2'],
    [ChessIndexName.Pawn_White_7, 'g2'],
    [ChessIndexName.Pawn_White_8, 'h2'],
    [ChessIndexName.Pawn_Black_1, 'a7'],
    [ChessIndexName.Pawn_Black_2, 'b7'],
    [ChessIndexName.Pawn_Black_3, 'c7'],
    [ChessIndexName.Pawn_Black_4, 'd7'],
    [ChessIndexName.Pawn_Black_5, 'e7'],
    [ChessIndexName.Pawn_Black_6, 'f7'],
    [ChessIndexName.Pawn_Black_7, 'g7'],
    [ChessIndexName.Pawn_Black_8, 'h7'],
    [ChessIndexName.Rook_Black_1, 'a8'],
    [ChessIndexName.Knight_Black_1, 'b8'],
    [ChessIndexName.Bishop_Black_1, 'c8'],
    [ChessIndexName.Queen_Black_1, 'd8'],
    [ChessIndexName.King_Black_1, 'e8'],
    [ChessIndexName.Bishop_Black_2, 'f8'],
    [ChessIndexName.Knight_Black_2, 'g8'],
    [ChessIndexName.Rook_Black_2, 'h8']
  ]);
  private readonly pawnPromotions: Map<ChessIndexName, number> = new Map<ChessIndexName, number>([
    [ChessIndexName.Pawn_White_1, 1],
    [ChessIndexName.Pawn_White_2, 1],
    [ChessIndexName.Pawn_White_3, 1],
    [ChessIndexName.Pawn_White_4, 1],
    [ChessIndexName.Pawn_White_5, 1],
    [ChessIndexName.Pawn_White_6, 1],
    [ChessIndexName.Pawn_White_7, 1],
    [ChessIndexName.Pawn_White_8, 1],
    [ChessIndexName.Pawn_Black_1, 1],
    [ChessIndexName.Pawn_Black_2, 1],
    [ChessIndexName.Pawn_Black_3, 1],
    [ChessIndexName.Pawn_Black_4, 1],
    [ChessIndexName.Pawn_Black_5, 1],
    [ChessIndexName.Pawn_Black_6, 1],
    [ChessIndexName.Pawn_Black_7, 1],
    [ChessIndexName.Pawn_Black_8, 1],
  ]);
  private readonly twinMap: Map<ChessIndexName, ChessIndexName> = new Map<ChessIndexName, ChessIndexName>([
    [ChessIndexName.Rook_White_1, ChessIndexName.Rook_White_2],
    [ChessIndexName.Knight_White_1, ChessIndexName.Knight_White_2],
    [ChessIndexName.Bishop_White_1, ChessIndexName.Bishop_White_2],
    [ChessIndexName.Bishop_White_2, ChessIndexName.Bishop_White_1],
    [ChessIndexName.Knight_White_2, ChessIndexName.Knight_White_1],
    [ChessIndexName.Rook_White_2, ChessIndexName.Rook_White_1],
    [ChessIndexName.Rook_Black_1, ChessIndexName.Rook_Black_2],
    [ChessIndexName.Knight_Black_1, ChessIndexName.Knight_Black_2],
    [ChessIndexName.Bishop_Black_1, ChessIndexName.Bishop_Black_2],
    [ChessIndexName.Bishop_Black_2, ChessIndexName.Bishop_Black_1],
    [ChessIndexName.Knight_Black_2, ChessIndexName.Knight_Black_1],
    [ChessIndexName.Rook_Black_2, ChessIndexName.Rook_Black_1],
  ]);
  private readonly kingMap: Map<ChessIndexName, ChessIndexName> = new Map<ChessIndexName, ChessIndexName>([
    [ChessIndexName.Rook_White_1, ChessIndexName.King_White_1],
    [ChessIndexName.Knight_White_1, ChessIndexName.King_White_1],
    [ChessIndexName.Bishop_White_1, ChessIndexName.King_White_1],
    [ChessIndexName.Queen_White_1, ChessIndexName.King_White_1],
    [ChessIndexName.King_White_1, ChessIndexName.King_White_1],
    [ChessIndexName.Bishop_White_2, ChessIndexName.King_White_1],
    [ChessIndexName.Knight_White_2, ChessIndexName.King_White_1],
    [ChessIndexName.Rook_White_2, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_1, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_2, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_3, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_4, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_5, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_6, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_7, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_White_8, ChessIndexName.King_White_1],
    [ChessIndexName.Pawn_Black_1, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_2, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_3, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_4, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_5, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_6, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_7, ChessIndexName.King_Black_1],
    [ChessIndexName.Pawn_Black_8, ChessIndexName.King_Black_1],
    [ChessIndexName.Rook_Black_1, ChessIndexName.King_Black_1],
    [ChessIndexName.Knight_Black_1, ChessIndexName.King_Black_1],
    [ChessIndexName.Bishop_Black_1, ChessIndexName.King_Black_1],
    [ChessIndexName.Queen_Black_1, ChessIndexName.King_Black_1],
    [ChessIndexName.King_Black_1, ChessIndexName.King_Black_1],
    [ChessIndexName.Bishop_Black_2, ChessIndexName.King_Black_1],
    [ChessIndexName.Knight_Black_2, ChessIndexName.King_Black_1],
    [ChessIndexName.Rook_Black_2, ChessIndexName.King_Black_1]
  ]);
  private readonly pawnPromotionMap: Map<string, number> = new Map<string, number>([
    ['k', 2],
    ['q', 3],
  ]);
  private readonly pieceIndexMap: Map<string, number> = new Map<string, number>([
    [ChessIndexName.Rook_White_1, 0],
    [ChessIndexName.Knight_White_1, 1],
    [ChessIndexName.Bishop_White_1, 2],
    [ChessIndexName.Queen_White_1, 3],
    [ChessIndexName.King_White_1, 4],
    [ChessIndexName.Bishop_White_2, 5],
    [ChessIndexName.Knight_White_2, 6],
    [ChessIndexName.Rook_White_2, 7],
    [ChessIndexName.Pawn_White_1, 8],
    [ChessIndexName.Pawn_White_2, 9],
    [ChessIndexName.Pawn_White_3, 10],
    [ChessIndexName.Pawn_White_4, 11],
    [ChessIndexName.Pawn_White_5, 12],
    [ChessIndexName.Pawn_White_6, 13],
    [ChessIndexName.Pawn_White_7, 14],
    [ChessIndexName.Pawn_White_8, 15],
    [ChessIndexName.Pawn_Black_1, 16],
    [ChessIndexName.Pawn_Black_2, 17],
    [ChessIndexName.Pawn_Black_3, 18],
    [ChessIndexName.Pawn_Black_4, 19],
    [ChessIndexName.Pawn_Black_5, 20],
    [ChessIndexName.Pawn_Black_6, 21],
    [ChessIndexName.Pawn_Black_7, 22],
    [ChessIndexName.Pawn_Black_8, 23],
    [ChessIndexName.Rook_Black_1, 24],
    [ChessIndexName.Knight_Black_1, 25],
    [ChessIndexName.Bishop_Black_1, 26],
    [ChessIndexName.Queen_Black_1, 27],
    [ChessIndexName.King_Black_1, 28],
    [ChessIndexName.Bishop_Black_2, 29],
    [ChessIndexName.Knight_Black_2, 30],
    [ChessIndexName.Rook_Black_2, 31]
  ]);
}