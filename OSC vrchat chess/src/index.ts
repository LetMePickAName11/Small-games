// @ts-ignore
import osc from 'osc';
import { Chess, Piece, Square } from 'chess.js'
//import * as fs from 'fs';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// @ts-ignore
import fs from 'fs-extra';

class ChessGame implements OSCVrChatGameLogic {
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
      Bishop_White_1_Position: this.getPiecePosition(ChessIndexName['Bishop_White_1']),
      Bishop_White_2_Position: this.getPiecePosition(ChessIndexName['Bishop_White_2']),
      Bishop_Black_1_Position: this.getPiecePosition(ChessIndexName['Bishop_Black_1']),
      Bishop_Black_2_Position: this.getPiecePosition(ChessIndexName['Bishop_Black_2']),
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
      this.input.selectedPath = this.chess.get(this.getSelectedPosition());

      // If selected piece and position is the same. Reset input
      if (this.input.pieceFile === this.input.newPositionFile && this.input.pieceRank === this.input.newPositionRank) {
        this.resetInput();
        return { updateVrc: false, message: 'Selected same position as piece, input reset.' };
      }
    }


    return this.attemptMove();
  }

  public debugInfo(): void {
    console.warn("Debug info");
    console.log(this.chess.ascii());
  }



  private attemptMove(): GameLogicResponse {
    try {
      if (this.input.selectedPiece?.type === 'p' && (this.input.newPositionRank === '1' || this.input.newPositionRank === '8') && this.chess.moves({ square: this.getSelectedPiece() }).length !== 0 && this.input.promotionInput === -1) {
        this.input.waitingForPromotionInput = true;
        return { updateVrc: false, message: 'Please select a piece to promote to.' };
      }

      // Will throw an error is invalid move
      this.chess.move({ from: this.getSelectedPiece<string>(), to: this.getSelectedPosition<string>(), promotion: this.getPromotionMove() });
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
    } catch (e) {
      // Simply reset input and display invalid move
      console.log(e)
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
    this.input.selectedPath = null;
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
    return this.pawnPromotions.get(pawnName)!;
  }

  private getPiecePosition(pieceName: ChessIndexName): number {
    const pieceSquare: Square = this.alivePieces.get(pieceName)! || this.alivePieces.get(this.twinMap.get(pieceName)!)! || this.alivePieces.get(this.kingMap.get(pieceName)!)!;
    return this.chessSquareToIndex(pieceSquare);
  }

  private getPieceTypeCaptured(pieceType: ChessIndexName): number {
    return (this.alivePieces.has(pieceType)! || this.alivePieces.has(this.twinMap.get(pieceType)!)!) ? 1 : 0;
  }

  private getSelectedPieceBit(): number {
    const square: Square = this.getSelectedPiece();
    return this.chessSquareToIndex(square);
  }

  private getSelectedPositionBit(): number {
    const square: Square = this.getSelectedPosition<Square>();
    return this.chessSquareToIndex(square);
  }

  private getSelectedPieceShown(): number {
    return this.getSelectedPiece<string>().length === 2 ? 1 : 0;
  }

  private getSelectedPositionShown(): number {
    return this.getSelectedPosition<string>().length === 2 ? 1 : 0;
  }


  private readonly input: ChessInput = {
    pieceFile: '',
    pieceRank: '',
    newPositionFile: '',
    newPositionRank: '',
    waitingForPromotionInput: false,
    promotionInput: -1,
    selectedPath: null,
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
    [ChessIndexName.Pawn_White_1, 0],
    [ChessIndexName.Pawn_White_2, 0],
    [ChessIndexName.Pawn_White_3, 0],
    [ChessIndexName.Pawn_White_4, 0],
    [ChessIndexName.Pawn_White_5, 0],
    [ChessIndexName.Pawn_White_6, 0],
    [ChessIndexName.Pawn_White_7, 0],
    [ChessIndexName.Pawn_White_8, 0],
    [ChessIndexName.Pawn_Black_1, 0],
    [ChessIndexName.Pawn_Black_2, 0],
    [ChessIndexName.Pawn_Black_3, 0],
    [ChessIndexName.Pawn_Black_4, 0],
    [ChessIndexName.Pawn_Black_5, 0],
    [ChessIndexName.Pawn_Black_6, 0],
    [ChessIndexName.Pawn_Black_7, 0],
    [ChessIndexName.Pawn_Black_8, 0],
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
}

class OSCVrChat {
  constructor(gameLogic: OSCVrChatGameLogic) {
    this.gameLogic = gameLogic;
    this.bitAllocations = JSON.parse(fs.readFileSync('configurations/user_defined_data/data.json', 'utf8'));
    this.bitAllocationConfigNames = this.bitAllocations.map((bitAllocation: BitAllocation) => bitAllocation.name);
    this.inputEventNames = JSON.parse(fs.readFileSync('configurations/user_defined_data/input.json', 'utf8'));

    this.validateBitAllocations();
    this.setupWebsocket();

    this.express = express();
    this.server = http.createServer(this.express);
    this.io = new Server(this.server);

    this.oscHandler = new osc.UDPPort({
      localAddress: this.url,
      localPort: this.vrChatUdpReceiverPort,
      remotePort: this.vrChatUdpSenderPort,
      metadata: false
    });

    this.oscHandler.on('message', this.onMessageRecived.bind(this));
    this.oscHandler.open();
    this.updateVrc();
  }

  public async testOnMessageRecived(address: string) {
    this.onMessageRecived({ address: address, args: [true] }, null, null);
    this.gameLogic.debugInfo();

    return new Promise(resolve => setTimeout(resolve, 251));
  }

  private positionToBits(val: number, size: number): number {
    return val & (Math.pow(2, size) - 1);
  }

  private replaceAt(string: string, index: number, replacement: string): string {
    return string.substr(0, index) + replacement + string.substr(index + replacement.length);
  }

  private piecePositionsToEightBitChunks(gameState: { [key in string]: number }): Array<{ name: EightBitChunkName, value: number }> {
    const chunkedBits = this.getAllocatedBits('noOverflow');
    let positionBitsString: string = ''.padStart(this.getAllocatedBitsSize(chunkedBits), '0');
    let currentIndex: number = 0;

    for (const bitAllocation of chunkedBits) {
      const positionBits: string = this.positionToBits(gameState[bitAllocation.name]!, bitAllocation.size).toString(2).padStart(bitAllocation.size, '0');
      positionBitsString = this.replaceAt(positionBitsString, currentIndex, positionBits);
      currentIndex += bitAllocation.size;
    }

    const bytes: Array<{ name: EightBitChunkName, value: number }> = [];
    currentIndex = 0;
    for (let i = 0; i < positionBitsString.length; i += 8) {
      const byteString: string = positionBitsString.substring(i, i + 8).padEnd(8, '0');
      bytes.push({ name: this.bitIndexToEightBitName[`${currentIndex}`]!, value: parseInt(byteString, 2) });
      currentIndex++;
    }

    return bytes;
  }

  private onMessageRecived(oscMsg: { address: string, args: Array<any> }, _timeTag: string | null, _info: string | null): void {
    if (!oscMsg.address.includes('!') || Date.now() - this.lastMessageDate < this.messageDelayMs) {
      return;
    }

    const eventType: string | undefined = oscMsg.address.split('!')[1];

    if (eventType === undefined) {
      throw new Error(`Invalid message input ${oscMsg.address}`);
    }

    this.lastMessageDate = Date.now();

    if (this.inputEventNames.includes(eventType)) {
      if (oscMsg.args[0] === false) {
        return;
      }

      const handleChessInputMessage: GameLogicResponse = this.gameLogic.handleInput(eventType);
      this.sendVrchatboxMessage(handleChessInputMessage.message);
      console.log(handleChessInputMessage);
      if (handleChessInputMessage.updateVrc) {
        return this.updateVrc();
      }
    }
    else {
      console.error(`Invalid message type: ${oscMsg.address}`);
    }
  }

  private updateVrc(): void {
    const gameState = this.gameLogic.getState();
    const missingBitAllocationConfigNames: string = this.bitAllocationConfigNames.filter((name: string) => !Object.keys(gameState).includes(name)).join(", ");

    if (missingBitAllocationConfigNames !== "") {
      throw new Error(missingBitAllocationConfigNames);
    }

    this.piecePositionsToEightBitChunks(gameState).forEach((byte) => {
      this.sendUdpMessage(`${byte.name}`, [{ type: 'i', value: byte.value }]);
    });

    this.getAllocatedBits('overflow').forEach((bitAllocation: BitAllocation) => {
      this.sendUdpMessage(`${bitAllocation.startName}`, [{ type: 'i', value: gameState[bitAllocation.name] }]);
    });
  }

  private sendVrchatboxMessage(message: string | null): void {
    if (message === '' || message === null || message === undefined) {
      return;
    }

    this.oscHandler.send({
      address: `/chatbox/input`,
      args: [
        {
          type: "s",
          value: message,
        },
        {
          type: "i",
          value: true
        }
      ]
    }, "127.0.0.1", 9000);
  }

  private sendUdpMessage(subAddress: string, args: Array<{ type: 'i' | 'f', value: any }>, url: string = '127.0.0.1', port: number = 9000): void {
    this.oscHandler.send({
      address: `/avatar/parameters/${subAddress}`,
      args: args
    }, url, port);
  }

  private validateBitAllocations(): void {
    const allocatedBitsSize: number = this.getAllocatedBitsSize(this.bitAllocations);

    if (allocatedBitsSize > 256) {
      console.error(`Too many bits allocated (limit 256): ${allocatedBitsSize}`);
      throw new Error(`Too many bits allocated (limit 256): ${allocatedBitsSize}`);
    }
  }

  private getAllocatedBits(includeOverflow: 'all' | 'overflow' | 'noOverflow'): Array<BitAllocation> {
    switch (includeOverflow) {
      case 'all': return this.bitAllocations;
      case 'overflow': return this.bitAllocations.filter((bitAllocation) => bitAllocation.name.includes("Overflow"));
      case 'noOverflow': return this.bitAllocations.filter((bitAllocation) => !bitAllocation.name.includes("Overflow"));
    }
  }

  private getAllocatedBitsSize(bitAllocation: Array<BitAllocation>): number {
    return bitAllocation.reduce((accumulator: number, obj: BitAllocation) => accumulator += obj.size, 0);
  }

  private setupWebsocket(): void {
    this.io.on('connection', (socket: SocketType) => {
      socket.on(WebSockNamesOut.getconfigurations, (v) => this.getconfigurations(socket, v));
      socket.on(WebSockNamesOut.getgamestate, (v) => this.getgamestate(socket, v));
      socket.on(WebSockNamesOut.getinputs, (v) => this.getinputs(socket, v));
      socket.on(WebSockNamesOut.mockinput, (v) => this.mockinput(socket, v));
      socket.on(WebSockNamesOut.updateconfigurations, (v) => this.updateconfigurations(socket, v));
      socket.on(WebSockNamesOut.updateinputs, (v) => this.updateinputs(socket, v));
    });    
  }

  private getconfigurations(socket: SocketType, ...args: any[]): void {
    const configuration = JSON.parse(fs.readFileSync('configurations/auto_generated_files_internal/data_mapped.json', 'utf8'));
    socket.emit(WebSockNamesOut.getconfigurations, configuration);
  } 

  private getgamestate(socket: SocketType, ...args: any[]): void {

  } 

  private getinputs(socket: SocketType, ...args: any[]): void {
    const inputs = JSON.parse(fs.readFileSync('configurations/user_defined_data/input.json', 'utf8'));
    socket.emit(WebSockNamesOut.getinputs, inputs);
  } 

  private mockinput(socket: SocketType, ...args: any[]): void {
    this.testOnMessageRecived(args[0]);
  } 

  private updateconfigurations(socket: SocketType, ...args: any[]): void {
    const obj = JSON.stringify(args[0]);
    fs.writeFile('configurations/user_defined_data/input.json', obj, 'utf8');
  } 

  private updateinputs(socket: SocketType, ...args: any[]): void {
    const obj = JSON.stringify(args[0]);
    fs.writeFile('configurations/user_defined_data/input.json', obj, 'utf8');
  }



  private lastMessageDate = Date.now() - 1000;

  private readonly vrChatUdpReceiverPort: number = 9001;
  private readonly vrChatUdpSenderPort: number = 9000;
  private readonly url: string = 'localhost';
  private readonly oscHandler;
  private readonly messageDelayMs = 250;
  private readonly gameLogic: OSCVrChatGameLogic;
  private readonly inputEventNames: Array<string>;
  private readonly bitAllocations: Array<BitAllocation>;
  private readonly bitIndexToEightBitName: { [key in string]: EightBitChunkName } = {
    '0': EightBitChunkName['0_MSBEightBit'],
    '1': EightBitChunkName['0_MSBMiddleEightBit'],
    '2': EightBitChunkName['0_LSBMiddleEightBit'],
    '3': EightBitChunkName['0_LSBEightBit'],
    '4': EightBitChunkName['1_MSBEightBit'],
    '5': EightBitChunkName['1_MSBMiddleEightBit'],
    '6': EightBitChunkName['1_LSBMiddleEightBit'],
    '7': EightBitChunkName['1_LSBEightBit'],
    '8': EightBitChunkName['2_MSBEightBit'],
    '9': EightBitChunkName['2_MSBMiddleEightBit'],
    '10': EightBitChunkName['2_LSBMiddleEightBit'],
    '11': EightBitChunkName['2_LSBEightBit'],
    '12': EightBitChunkName['3_MSBEightBit'],
    '13': EightBitChunkName['3_MSBMiddleEightBit'],
    '14': EightBitChunkName['3_LSBMiddleEightBit'],
    '15': EightBitChunkName['3_LSBEightBit'],
    '16': EightBitChunkName['4_MSBEightBit'],
    '17': EightBitChunkName['4_MSBMiddleEightBit'],
    '18': EightBitChunkName['4_LSBMiddleEightBit'],
    '19': EightBitChunkName['4_LSBEightBit'],
    '20': EightBitChunkName['5_MSBEightBit'],
    '21': EightBitChunkName['5_MSBMiddleEightBit'],
    '22': EightBitChunkName['5_LSBMiddleEightBit'],
    '23': EightBitChunkName['5_LSBEightBit'],
    '24': EightBitChunkName['6_MSBEightBit'],
    '25': EightBitChunkName['6_MSBMiddleEightBit'],
    '26': EightBitChunkName['6_LSBMiddleEightBit'],
    '27': EightBitChunkName['6_LSBEightBit'],
    '28': EightBitChunkName['7_MSBEightBit'],
    '29': EightBitChunkName['7_MSBMiddleEightBit'],
    '30': EightBitChunkName['7_LSBMiddleEightBit'],
    '31': EightBitChunkName['7_LSBEightBit']
  };
  private readonly bitAllocationConfigNames: Array<string>;
  private readonly express;
  private readonly server;
  private readonly io;
}

function main() {
  const oscVrchat = new OSCVrChat(new ChessGame());
  if (oscVrchat === undefined) {
    return;
  }
  console.log("Started up");

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  const port = 3000;

  app.use(express.json());  // Middleware to parse JSON bodies

  // Socket.IO for real-time communication
  io.on('connection', (socket) => {
    console.log("New connection:", socket.id);

    socket.on('message', async (msg) => {
      console.log("Received message:", msg);
      socket.broadcast.emit('message', msg);

      // Writing message to a file asynchronously
      try {
        await fs.appendFile('messages.txt', `${msg}\n`);
      } catch (error) {
        console.error('Failed to write message:', error);
      }
    });

    socket.on(WebSockNamesOut.getconfigurations, async () => {
      try {
        const data = await fs.readFile('messages.txt', 'utf8');
        socket.emit('fileContent', data);
      } catch (error) {
        socket.emit('fileError', 'Failed to read file');
      }
    });

    socket.on(WebSockNamesOut.getinputs, async () => {
      try {
        const data = await fs.readFile('messages.txt', 'utf8');
        socket.emit('fileContent', data);
      } catch (error) {
        socket.emit('fileError', 'Failed to read file');
      }
    });

    socket.on(WebSockNamesOut.getgamestate, async () => {
      try {
        const data = await fs.readFile('messages.txt', 'utf8');
        socket.emit('fileContent', data);
      } catch (error) {
        socket.emit('fileError', 'Failed to read file');
      }
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}


main();


interface OSCVrChatGameLogic {
  getState(): { [key in string]: number };
  handleInput(input: string): GameLogicResponse;
  debugInfo(): void
}

interface ChessInput {
  pieceFile: string;
  pieceRank: string;
  newPositionFile: string;
  newPositionRank: string;
  waitingForPromotionInput: boolean;
  promotionInput: number;
  selectedPath: Piece | null;
  selectedPiece: Piece | null;
}

interface GameLogicResponse {
  message: string | null;
  updateVrc: boolean;
}

interface BitAllocation {
  range: {
    start: number;
    end: number;
  };
  size: number;
  type: BitAllocationType;
  name: string; // paramater name
  startName: string;
  endName: string;
  bitIndex: number;
  objectNames: Array<string>; // Unity object name which properties will be updated via generated animations
  shaderParameters: Array<string>; // Shader paramter names [firstBits, lastBits]
}

interface SocketType {
   emit(getconfigurations: string, a: any): void; 
   on: (arg0: string, arg1: (v: any) => any) => void;
}

type WebSockNamesOut = 'getconfigurations' | 'getgamestate' | 'getinputs' | 'mockinput' | 'updateconfigurations' | 'updateinputs';
type WebSockNamesIn = 'inputrecieved' | 'gamestateupdated';

const enum ChessIndexName {
  Empty_1 = "Empty_1",
  Rook_White_1 = "Rook_White_1",
  Knight_White_1 = "Knight_White_1",
  Bishop_White_1 = "Bishop_White_1",
  Queen_White_1 = "Queen_White_1",
  King_White_1 = "King_White_1",
  Bishop_White_2 = "Bishop_White_2",
  Knight_White_2 = "Knight_White_2",
  Rook_White_2 = "Rook_White_2",
  Pawn_White_1 = "Pawn_White_1",
  Pawn_White_2 = "Pawn_White_2",
  Pawn_White_3 = "Pawn_White_3",
  Pawn_White_4 = "Pawn_White_4",
  Pawn_White_5 = "Pawn_White_5",
  Pawn_White_6 = "Pawn_White_6",
  Pawn_White_7 = "Pawn_White_7",
  Pawn_White_8 = "Pawn_White_8",
  Pawn_Black_1 = "Pawn_Black_1",
  Pawn_Black_2 = "Pawn_Black_2",
  Pawn_Black_3 = "Pawn_Black_3",
  Pawn_Black_4 = "Pawn_Black_4",
  Pawn_Black_5 = "Pawn_Black_5",
  Pawn_Black_6 = "Pawn_Black_6",
  Pawn_Black_7 = "Pawn_Black_7",
  Pawn_Black_8 = "Pawn_Black_8",
  Rook_Black_1 = "Rook_Black_1",
  Knight_Black_1 = "Knight_Black_1",
  Bishop_Black_1 = "Bishop_Black_1",
  Queen_Black_1 = "Queen_Black_1",
  King_Black_1 = "King_Black_1",
  Bishop_Black_2 = "Bishop_Black_2",
  Knight_Black_2 = "Knight_Black_2",
  Rook_Black_2 = "Rook_Black_2",
}

const enum EightBitChunkName {
  '0_MSBEightBit' = '0_MSBEightBit',
  '0_MSBMiddleEightBit' = '0_MSBMiddleEightBit',
  '0_LSBMiddleEightBit' = '0_LSBMiddleEightBit',
  '0_LSBEightBit' = '0_LSBEightBit',
  '1_MSBEightBit' = '1_MSBEightBit',
  '1_MSBMiddleEightBit' = '1_MSBMiddleEightBit',
  '1_LSBMiddleEightBit' = '1_LSBMiddleEightBit',
  '1_LSBEightBit' = '1_LSBEightBit',
  '2_MSBEightBit' = '2_MSBEightBit',
  '2_MSBMiddleEightBit' = '2_MSBMiddleEightBit',
  '2_LSBMiddleEightBit' = '2_LSBMiddleEightBit',
  '2_LSBEightBit' = '2_LSBEightBit',
  '3_MSBEightBit' = '3_MSBEightBit',
  '3_MSBMiddleEightBit' = '3_MSBMiddleEightBit',
  '3_LSBMiddleEightBit' = '3_LSBMiddleEightBit',
  '3_LSBEightBit' = '3_LSBEightBit',
  '4_MSBEightBit' = '4_MSBEightBit',
  '4_MSBMiddleEightBit' = '4_MSBMiddleEightBit',
  '4_LSBMiddleEightBit' = '4_LSBMiddleEightBit',
  '4_LSBEightBit' = '4_LSBEightBit',
  '5_MSBEightBit' = '5_MSBEightBit',
  '5_MSBMiddleEightBit' = '5_MSBMiddleEightBit',
  '5_LSBMiddleEightBit' = '5_LSBMiddleEightBit',
  '5_LSBEightBit' = '5_LSBEightBit',
  '6_MSBEightBit' = '6_MSBEightBit',
  '6_MSBMiddleEightBit' = '6_MSBMiddleEightBit',
  '6_LSBMiddleEightBit' = '6_LSBMiddleEightBit',
  '6_LSBEightBit' = '6_LSBEightBit',
  '7_MSBEightBit' = '7_MSBEightBit',
  '7_MSBMiddleEightBit' = '7_MSBMiddleEightBit',
  '7_LSBMiddleEightBit' = '7_LSBMiddleEightBit',
  '7_LSBEightBit' = '7_LSBEightBit',
}

const enum BitAllocationType {
  Int = 'i',
  Bool = 'i'
}

const WebSockNamesOut = {
  'getconfigurations': 'getconfigurations' as WebSockNamesOut,
  'getgamestate': 'getgamestate' as WebSockNamesOut,
  'getinputs': 'getinputs' as WebSockNamesOut,
  'mockinput': 'mockinput' as WebSockNamesOut,
  'updateconfigurations': 'updateconfigurations' as WebSockNamesOut,
  'updateinputs': 'updateinputs' as WebSockNamesOut
};

const WebSockNamesIn = {
  'inputrecieved': 'inputrecieved' as WebSockNamesOut,
  'gamestateupdated': 'inputrecieved' as WebSockNamesOut
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  Data structure.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/*
256 - bit limit. Color and logic is handled elsewhere. An index will be used to access specific bits.
[
  (188 - bits | 188 - bits)
  0 - 187
  Keep track of each piece position(28x6 + 4x5 - bit. 64 possible positions for pieces, except bishop that only need 32)

  (32 - bits | 220 - bits)
  188 - 219
  Keep track of pawn promotions(16x2 - bit. Unpromoted / pawn, knight, queen, captured)

  (8 - bits | 228 - bits) // can be saved if phat ass king
  220-227
  Keep track of piece captures(8x1 - bit. All of type pieces captured, both All of type alive (except king since they can't be captured. Otherwise hide captured piece under twin))

  (8 - bits | 236 - bits)
  228 - 235
  Keep track of input(8x1 - bit. 1-8 for inputs that are translated to file and rank)

  (5 - bits | 241 - bits)
  236 - 240
  Keep track of selected piece and position(1x5 - bit. 32 different pieces to highlight)

  (6 - bits | 247 - bits)
  241 - 246
  Keep track of selected piece and position(1x6 - bit. Which position to highlight)

  (2 - bits | 249 - bits)
  247 - 248
  Keep track of if highlighted piece and position should be shown(2x1 - bit. Show, hide)

  (7 - bits | 256 - bits)
  249 - 255
  Unused
]
*/