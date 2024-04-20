"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const osc_1 = __importDefault(require("osc"));
const chess_js_1 = require("chess.js");
const fs = __importStar(require("fs"));
class ChessGame {
    constructor() {
        this.input = {
            pieceFile: '',
            pieceRank: '',
            newPositionFile: '',
            newPositionRank: '',
            waitingForPromotionInput: false,
            promotionInput: -1,
            selectedPath: null,
            selectedPiece: null,
        };
        this.chess = new chess_js_1.Chess();
        this.alivePieces = new Map([
            ["Rook_White_1" /* ChessIndexName.Rook_White_1 */, 'a1'],
            ["Knight_White_1" /* ChessIndexName.Knight_White_1 */, 'b1'],
            ["Bishop_White_1" /* ChessIndexName.Bishop_White_1 */, 'c1'],
            ["Queen_White_1" /* ChessIndexName.Queen_White_1 */, 'd1'],
            ["King_White_1" /* ChessIndexName.King_White_1 */, 'e1'],
            ["Bishop_White_2" /* ChessIndexName.Bishop_White_2 */, 'f1'],
            ["Knight_White_2" /* ChessIndexName.Knight_White_2 */, 'g1'],
            ["Rook_White_2" /* ChessIndexName.Rook_White_2 */, 'h1'],
            ["Pawn_White_1" /* ChessIndexName.Pawn_White_1 */, 'a2'],
            ["Pawn_White_2" /* ChessIndexName.Pawn_White_2 */, 'b2'],
            ["Pawn_White_3" /* ChessIndexName.Pawn_White_3 */, 'c2'],
            ["Pawn_White_4" /* ChessIndexName.Pawn_White_4 */, 'd2'],
            ["Pawn_White_5" /* ChessIndexName.Pawn_White_5 */, 'e2'],
            ["Pawn_White_6" /* ChessIndexName.Pawn_White_6 */, 'f2'],
            ["Pawn_White_7" /* ChessIndexName.Pawn_White_7 */, 'g2'],
            ["Pawn_White_8" /* ChessIndexName.Pawn_White_8 */, 'h2'],
            ["Pawn_Black_1" /* ChessIndexName.Pawn_Black_1 */, 'a7'],
            ["Pawn_Black_2" /* ChessIndexName.Pawn_Black_2 */, 'b7'],
            ["Pawn_Black_3" /* ChessIndexName.Pawn_Black_3 */, 'c7'],
            ["Pawn_Black_4" /* ChessIndexName.Pawn_Black_4 */, 'd7'],
            ["Pawn_Black_5" /* ChessIndexName.Pawn_Black_5 */, 'e7'],
            ["Pawn_Black_6" /* ChessIndexName.Pawn_Black_6 */, 'f7'],
            ["Pawn_Black_7" /* ChessIndexName.Pawn_Black_7 */, 'g7'],
            ["Pawn_Black_8" /* ChessIndexName.Pawn_Black_8 */, 'h7'],
            ["Rook_Black_1" /* ChessIndexName.Rook_Black_1 */, 'a8'],
            ["Knight_Black_1" /* ChessIndexName.Knight_Black_1 */, 'b8'],
            ["Bishop_Black_1" /* ChessIndexName.Bishop_Black_1 */, 'c8'],
            ["Queen_Black_1" /* ChessIndexName.Queen_Black_1 */, 'd8'],
            ["King_Black_1" /* ChessIndexName.King_Black_1 */, 'e8'],
            ["Bishop_Black_2" /* ChessIndexName.Bishop_Black_2 */, 'f8'],
            ["Knight_Black_2" /* ChessIndexName.Knight_Black_2 */, 'g8'],
            ["Rook_Black_2" /* ChessIndexName.Rook_Black_2 */, 'h8']
        ]);
        this.pawnPromotions = new Map([
            ["Pawn_White_1" /* ChessIndexName.Pawn_White_1 */, 0],
            ["Pawn_White_2" /* ChessIndexName.Pawn_White_2 */, 0],
            ["Pawn_White_3" /* ChessIndexName.Pawn_White_3 */, 0],
            ["Pawn_White_4" /* ChessIndexName.Pawn_White_4 */, 0],
            ["Pawn_White_5" /* ChessIndexName.Pawn_White_5 */, 0],
            ["Pawn_White_6" /* ChessIndexName.Pawn_White_6 */, 0],
            ["Pawn_White_7" /* ChessIndexName.Pawn_White_7 */, 0],
            ["Pawn_White_8" /* ChessIndexName.Pawn_White_8 */, 0],
            ["Pawn_Black_1" /* ChessIndexName.Pawn_Black_1 */, 0],
            ["Pawn_Black_2" /* ChessIndexName.Pawn_Black_2 */, 0],
            ["Pawn_Black_3" /* ChessIndexName.Pawn_Black_3 */, 0],
            ["Pawn_Black_4" /* ChessIndexName.Pawn_Black_4 */, 0],
            ["Pawn_Black_5" /* ChessIndexName.Pawn_Black_5 */, 0],
            ["Pawn_Black_6" /* ChessIndexName.Pawn_Black_6 */, 0],
            ["Pawn_Black_7" /* ChessIndexName.Pawn_Black_7 */, 0],
            ["Pawn_Black_8" /* ChessIndexName.Pawn_Black_8 */, 0],
        ]);
        this.twinMap = new Map([
            ["Rook_White_1" /* ChessIndexName.Rook_White_1 */, "Rook_White_2" /* ChessIndexName.Rook_White_2 */],
            ["Knight_White_1" /* ChessIndexName.Knight_White_1 */, "Knight_White_2" /* ChessIndexName.Knight_White_2 */],
            ["Bishop_White_1" /* ChessIndexName.Bishop_White_1 */, "Bishop_White_2" /* ChessIndexName.Bishop_White_2 */],
            ["Bishop_White_2" /* ChessIndexName.Bishop_White_2 */, "Bishop_White_1" /* ChessIndexName.Bishop_White_1 */],
            ["Knight_White_2" /* ChessIndexName.Knight_White_2 */, "Knight_White_1" /* ChessIndexName.Knight_White_1 */],
            ["Rook_White_2" /* ChessIndexName.Rook_White_2 */, "Rook_White_1" /* ChessIndexName.Rook_White_1 */],
            ["Rook_Black_1" /* ChessIndexName.Rook_Black_1 */, "Rook_Black_2" /* ChessIndexName.Rook_Black_2 */],
            ["Knight_Black_1" /* ChessIndexName.Knight_Black_1 */, "Knight_Black_2" /* ChessIndexName.Knight_Black_2 */],
            ["Bishop_Black_1" /* ChessIndexName.Bishop_Black_1 */, "Bishop_Black_2" /* ChessIndexName.Bishop_Black_2 */],
            ["Bishop_Black_2" /* ChessIndexName.Bishop_Black_2 */, "Bishop_Black_1" /* ChessIndexName.Bishop_Black_1 */],
            ["Knight_Black_2" /* ChessIndexName.Knight_Black_2 */, "Knight_Black_1" /* ChessIndexName.Knight_Black_1 */],
            ["Rook_Black_2" /* ChessIndexName.Rook_Black_2 */, "Rook_Black_1" /* ChessIndexName.Rook_Black_1 */],
        ]);
        this.kingMap = new Map([
            ["Rook_White_1" /* ChessIndexName.Rook_White_1 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Knight_White_1" /* ChessIndexName.Knight_White_1 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Bishop_White_1" /* ChessIndexName.Bishop_White_1 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Queen_White_1" /* ChessIndexName.Queen_White_1 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["King_White_1" /* ChessIndexName.King_White_1 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Bishop_White_2" /* ChessIndexName.Bishop_White_2 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Knight_White_2" /* ChessIndexName.Knight_White_2 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Rook_White_2" /* ChessIndexName.Rook_White_2 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_1" /* ChessIndexName.Pawn_White_1 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_2" /* ChessIndexName.Pawn_White_2 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_3" /* ChessIndexName.Pawn_White_3 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_4" /* ChessIndexName.Pawn_White_4 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_5" /* ChessIndexName.Pawn_White_5 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_6" /* ChessIndexName.Pawn_White_6 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_7" /* ChessIndexName.Pawn_White_7 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_White_8" /* ChessIndexName.Pawn_White_8 */, "King_White_1" /* ChessIndexName.King_White_1 */],
            ["Pawn_Black_1" /* ChessIndexName.Pawn_Black_1 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_2" /* ChessIndexName.Pawn_Black_2 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_3" /* ChessIndexName.Pawn_Black_3 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_4" /* ChessIndexName.Pawn_Black_4 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_5" /* ChessIndexName.Pawn_Black_5 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_6" /* ChessIndexName.Pawn_Black_6 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_7" /* ChessIndexName.Pawn_Black_7 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Pawn_Black_8" /* ChessIndexName.Pawn_Black_8 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Rook_Black_1" /* ChessIndexName.Rook_Black_1 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Knight_Black_1" /* ChessIndexName.Knight_Black_1 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Bishop_Black_1" /* ChessIndexName.Bishop_Black_1 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Queen_Black_1" /* ChessIndexName.Queen_Black_1 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["King_Black_1" /* ChessIndexName.King_Black_1 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Bishop_Black_2" /* ChessIndexName.Bishop_Black_2 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Knight_Black_2" /* ChessIndexName.Knight_Black_2 */, "King_Black_1" /* ChessIndexName.King_Black_1 */],
            ["Rook_Black_2" /* ChessIndexName.Rook_Black_2 */, "King_Black_1" /* ChessIndexName.King_Black_1 */]
        ]);
    }
    getState() {
        const res = {
            Pawn_White_1_Promotion: this.getPawnPromotion("Pawn_White_1" /* ChessIndexName['Pawn_White_1'] */),
            Pawn_White_2_Promotion: this.getPawnPromotion("Pawn_White_2" /* ChessIndexName['Pawn_White_2'] */),
            Pawn_White_3_Promotion: this.getPawnPromotion("Pawn_White_3" /* ChessIndexName['Pawn_White_3'] */),
            Pawn_White_4_Promotion: this.getPawnPromotion("Pawn_White_4" /* ChessIndexName['Pawn_White_4'] */),
            Pawn_White_5_Promotion: this.getPawnPromotion("Pawn_White_5" /* ChessIndexName['Pawn_White_5'] */),
            Pawn_White_6_Promotion: this.getPawnPromotion("Pawn_White_6" /* ChessIndexName['Pawn_White_6'] */),
            Pawn_White_7_Promotion: this.getPawnPromotion("Pawn_White_7" /* ChessIndexName['Pawn_White_7'] */),
            Pawn_White_8_Promotion: this.getPawnPromotion("Pawn_White_8" /* ChessIndexName['Pawn_White_8'] */),
            Pawn_Black_1_Promotion: this.getPawnPromotion("Pawn_Black_1" /* ChessIndexName['Pawn_Black_1'] */),
            Pawn_Black_2_Promotion: this.getPawnPromotion("Pawn_Black_2" /* ChessIndexName['Pawn_Black_2'] */),
            Pawn_Black_3_Promotion: this.getPawnPromotion("Pawn_Black_3" /* ChessIndexName['Pawn_Black_3'] */),
            Pawn_Black_4_Promotion: this.getPawnPromotion("Pawn_Black_4" /* ChessIndexName['Pawn_Black_4'] */),
            Pawn_Black_5_Promotion: this.getPawnPromotion("Pawn_Black_5" /* ChessIndexName['Pawn_Black_5'] */),
            Pawn_Black_6_Promotion: this.getPawnPromotion("Pawn_Black_6" /* ChessIndexName['Pawn_Black_6'] */),
            Pawn_Black_7_Promotion: this.getPawnPromotion("Pawn_Black_7" /* ChessIndexName['Pawn_Black_7'] */),
            Pawn_Black_8_Promotion: this.getPawnPromotion("Pawn_Black_8" /* ChessIndexName['Pawn_Black_8'] */),
            Pawn_White_1_Position: this.getPiecePosition("Pawn_White_1" /* ChessIndexName['Pawn_White_1'] */),
            Pawn_White_2_Position: this.getPiecePosition("Pawn_White_2" /* ChessIndexName['Pawn_White_2'] */),
            Pawn_White_3_Position: this.getPiecePosition("Pawn_White_3" /* ChessIndexName['Pawn_White_3'] */),
            Pawn_White_4_Position: this.getPiecePosition("Pawn_White_4" /* ChessIndexName['Pawn_White_4'] */),
            Pawn_White_5_Position: this.getPiecePosition("Pawn_White_5" /* ChessIndexName['Pawn_White_5'] */),
            Pawn_White_6_Position: this.getPiecePosition("Pawn_White_6" /* ChessIndexName['Pawn_White_6'] */),
            Pawn_White_7_Position: this.getPiecePosition("Pawn_White_7" /* ChessIndexName['Pawn_White_7'] */),
            Pawn_White_8_Position: this.getPiecePosition("Pawn_White_8" /* ChessIndexName['Pawn_White_8'] */),
            Pawn_Black_1_Position: this.getPiecePosition("Pawn_Black_1" /* ChessIndexName['Pawn_Black_1'] */),
            Pawn_Black_2_Position: this.getPiecePosition("Pawn_Black_2" /* ChessIndexName['Pawn_Black_2'] */),
            Pawn_Black_3_Position: this.getPiecePosition("Pawn_Black_3" /* ChessIndexName['Pawn_Black_3'] */),
            Pawn_Black_4_Position: this.getPiecePosition("Pawn_Black_4" /* ChessIndexName['Pawn_Black_4'] */),
            Pawn_Black_5_Position: this.getPiecePosition("Pawn_Black_5" /* ChessIndexName['Pawn_Black_5'] */),
            Pawn_Black_6_Position: this.getPiecePosition("Pawn_Black_6" /* ChessIndexName['Pawn_Black_6'] */),
            Pawn_Black_7_Position: this.getPiecePosition("Pawn_Black_7" /* ChessIndexName['Pawn_Black_7'] */),
            Pawn_Black_8_Position: this.getPiecePosition("Pawn_Black_8" /* ChessIndexName['Pawn_Black_8'] */),
            Rook_White_1_Position: this.getPiecePosition("Rook_White_1" /* ChessIndexName['Rook_White_1'] */),
            Rook_White_2_Position: this.getPiecePosition("Rook_White_2" /* ChessIndexName['Rook_White_2'] */),
            Rook_Black_1_Position: this.getPiecePosition("Rook_Black_1" /* ChessIndexName['Rook_Black_1'] */),
            Rook_Black_2_Position: this.getPiecePosition("Rook_Black_2" /* ChessIndexName['Rook_Black_2'] */),
            Bishop_White_1_Position: this.getPiecePosition("Bishop_White_1" /* ChessIndexName['Bishop_White_1'] */),
            Bishop_White_2_Position: this.getPiecePosition("Bishop_White_2" /* ChessIndexName['Bishop_White_2'] */),
            Bishop_Black_1_Position: this.getPiecePosition("Bishop_Black_1" /* ChessIndexName['Bishop_Black_1'] */),
            Bishop_Black_2_Position: this.getPiecePosition("Bishop_Black_2" /* ChessIndexName['Bishop_Black_2'] */),
            Knight_White_1_Position: this.getPiecePosition("Knight_White_1" /* ChessIndexName['Knight_White_1'] */),
            Knight_White_2_Position: this.getPiecePosition("Knight_White_2" /* ChessIndexName['Knight_White_2'] */),
            Knight_Black_1_Position: this.getPiecePosition("Knight_Black_1" /* ChessIndexName['Knight_Black_1'] */),
            Knight_Black_2_Position: this.getPiecePosition("Knight_Black_2" /* ChessIndexName['Knight_Black_2'] */),
            Queen_White_1_Position: this.getPiecePosition("Queen_White_1" /* ChessIndexName['Queen_White_1'] */),
            King_White_1_Position: this.getPiecePosition("King_White_1" /* ChessIndexName['King_White_1'] */),
            Queen_Black_1_Position: this.getPiecePosition("Queen_Black_1" /* ChessIndexName['Queen_Black_1'] */),
            King_Black_1_Position: this.getPiecePosition("King_Black_1" /* ChessIndexName['King_Black_1'] */),
            Rook_White_Both_Captured: this.getPieceTypeCaptured("Rook_White_1" /* ChessIndexName['Rook_White_1'] */),
            Rook_Black_Both_Captured: this.getPieceTypeCaptured("Rook_Black_1" /* ChessIndexName['Rook_Black_1'] */),
            Bishop_White_Both_Captured: this.getPieceTypeCaptured("Bishop_White_1" /* ChessIndexName['Bishop_White_1'] */),
            Bishop_Black_Both_Captured: this.getPieceTypeCaptured("Bishop_Black_1" /* ChessIndexName['Bishop_Black_1'] */),
            Knight_White_Both_Captured: this.getPieceTypeCaptured("Knight_White_1" /* ChessIndexName['Knight_White_1'] */),
            Knight_Black_Both_Captured: this.getPieceTypeCaptured("Knight_Black_1" /* ChessIndexName['Knight_Black_1'] */),
            Queen_White_1_Captured: this.getPieceTypeCaptured("Queen_White_1" /* ChessIndexName['Queen_White_1'] */),
            Queen_Black_1_Captured: this.getPieceTypeCaptured("Queen_Black_1" /* ChessIndexName['Queen_Black_1'] */),
            Selected_Piece: this.getSelectedPieceBit(),
            Selected_Position: this.getSelectedPositionBit(),
            Selected_Piece_Shown: this.getSelectedPieceShown(),
            Selected_Position_Shown: this.getSelectedPositionShown()
        };
        return res;
    }
    handleInput(inputString) {
        // get the input index from input string.
        // f.x. Input_1 -> 1 or Input_6 -> 6.
        const inputNumber = Number(inputString.split('_')[1]);
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
    debugInfo() {
        console.warn("Debug info");
        console.log(this.chess.ascii());
    }
    attemptMove() {
        try {
            if (this.input.selectedPiece.type === 'p' && (this.input.newPositionRank === '1' || this.input.newPositionRank === '8') && this.chess.moves({ square: this.getSelectedPiece() }).length !== 0 && this.input.promotionInput === -1) {
                this.input.waitingForPromotionInput = true;
                return { updateVrc: false, message: 'Please select a piece to promote to.' };
            }
            // Will throw an error is invalid move
            this.chess.move({ from: this.getSelectedPiece(), to: this.getSelectedPosition(), promotion: this.getPromotionMove() });
            const potentialCapturedPiece = [...this.alivePieces].find(([_key, val]) => val == this.getSelectedPosition());
            const movedPiece = [...this.alivePieces].find(([_key, val]) => val == this.getSelectedPiece());
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
        }
        catch (e) {
            // Simply reset input and display invalid move
            console.log(e);
            this.resetInput();
            return { updateVrc: false, message: 'Invalid move.' };
        }
        const message = this.generateChessMoveText();
        this.resetInput();
        return { updateVrc: true, message: message };
    }
    getSelectedPiece() {
        return `${this.input.pieceFile}${this.input.pieceRank}`;
    }
    getSelectedPosition() {
        return `${this.input.newPositionFile}${this.input.newPositionRank}`;
    }
    chessSquareToIndex(square) {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // Calculates file index: 'a' -> 0, 'b' -> 1, ..., 'h' -> 7
        const rank = parseInt(square[1]) - 1; // Converts rank to 0-based index: '1' -> 0, '2' -> 1, ..., '8' -> 7
        return rank * 8 + file;
    }
    getPromotionMove() {
        switch (this.input.promotionInput) {
            case 1:
                return 'n';
            case 2:
                return 'q';
            default:
                return null;
        }
    }
    resetInput() {
        this.input.pieceFile = '';
        this.input.pieceRank = '';
        this.input.newPositionFile = '';
        this.input.newPositionRank = '';
        this.input.waitingForPromotionInput = false;
        this.input.promotionInput = -1;
        this.input.selectedPath = null;
        this.input.selectedPiece = null;
    }
    generateChessMoveText() {
        let res = '';
        res += `${this.getSelectedPiece()} -> ${this.getSelectedPosition()}.`;
        if (this.chess.isCheck()) {
            res += ' Check.';
        }
        else if (this.chess.isCheckmate()) {
            res += ' Check mate.';
        }
        else if (this.chess.isThreefoldRepetition()) {
            res += ' Three fold repetition.';
        }
        else if (this.chess.isInsufficientMaterial()) {
            res += ' Insufficient material.';
        }
        else if (this.chess.isDraw()) {
            res += ' Draw.';
        } // Add fifty move rule
        return res;
    }
    getPawnPromotion(pawnName) {
        return this.pawnPromotions[pawnName];
    }
    getPiecePosition(pieceName) {
        let pieceSquare = this.alivePieces.get(pieceName) || this.alivePieces.get(this.twinMap.get(pieceName)) || this.alivePieces.get(this.kingMap.get(pieceName));
        return this.chessSquareToIndex(pieceSquare);
    }
    getPieceTypeCaptured(pieceType) {
        return (this.alivePieces.has(pieceType) || this.alivePieces.has(this.twinMap.get(pieceType))) ? 1 : 0;
    }
    getSelectedPieceBit() {
        const square = this.getSelectedPiece();
        if (square.length !== 2) {
            return 0;
        }
        return this.chessSquareToIndex(square);
    }
    getSelectedPositionBit() {
        const square = this.getSelectedPosition();
        if (square.length !== 2) {
            return 0;
        }
        return this.chessSquareToIndex(square);
    }
    getSelectedPieceShown() {
        return this.getSelectedPiece().length === 2 ? 1 : 0;
    }
    getSelectedPositionShown() {
        return this.getSelectedPosition().length === 2 ? 1 : 0;
    }
}
class OSCVrChat {
    constructor(gameLogic) {
        this.lastMessageDate = Date.now() - 1000;
        this.vrChatUdpReceiverPort = 9001;
        this.vrChatUdpSenderPort = 9000;
        this.url = 'localhost';
        this.messageDelayMs = 250;
        this.bitIndexToEightBitName = {
            '0': "0_MSBEightBit" /* EightBitChunkName['0_MSBEightBit'] */,
            '1': "0_MSBMiddleEightBit" /* EightBitChunkName['0_MSBMiddleEightBit'] */,
            '2': "0_LSBMiddleEightBit" /* EightBitChunkName['0_LSBMiddleEightBit'] */,
            '3': "0_LSBEightBit" /* EightBitChunkName['0_LSBEightBit'] */,
            '4': "1_MSBEightBit" /* EightBitChunkName['1_MSBEightBit'] */,
            '5': "1_MSBMiddleEightBit" /* EightBitChunkName['1_MSBMiddleEightBit'] */,
            '6': "1_LSBMiddleEightBit" /* EightBitChunkName['1_LSBMiddleEightBit'] */,
            '7': "1_LSBEightBit" /* EightBitChunkName['1_LSBEightBit'] */,
            '8': "2_MSBEightBit" /* EightBitChunkName['2_MSBEightBit'] */,
            '9': "2_MSBMiddleEightBit" /* EightBitChunkName['2_MSBMiddleEightBit'] */,
            '10': "2_LSBMiddleEightBit" /* EightBitChunkName['2_LSBMiddleEightBit'] */,
            '11': "2_LSBEightBit" /* EightBitChunkName['2_LSBEightBit'] */,
            '12': "3_MSBEightBit" /* EightBitChunkName['3_MSBEightBit'] */,
            '13': "3_MSBMiddleEightBit" /* EightBitChunkName['3_MSBMiddleEightBit'] */,
            '14': "3_LSBMiddleEightBit" /* EightBitChunkName['3_LSBMiddleEightBit'] */,
            '15': "3_LSBEightBit" /* EightBitChunkName['3_LSBEightBit'] */,
            '16': "4_MSBEightBit" /* EightBitChunkName['4_MSBEightBit'] */,
            '17': "4_MSBMiddleEightBit" /* EightBitChunkName['4_MSBMiddleEightBit'] */,
            '18': "4_LSBMiddleEightBit" /* EightBitChunkName['4_LSBMiddleEightBit'] */,
            '19': "4_LSBEightBit" /* EightBitChunkName['4_LSBEightBit'] */,
            '20': "5_MSBEightBit" /* EightBitChunkName['5_MSBEightBit'] */,
            '21': "5_MSBMiddleEightBit" /* EightBitChunkName['5_MSBMiddleEightBit'] */,
            '22': "5_LSBMiddleEightBit" /* EightBitChunkName['5_LSBMiddleEightBit'] */,
            '23': "5_LSBEightBit" /* EightBitChunkName['5_LSBEightBit'] */,
            '24': "6_MSBEightBit" /* EightBitChunkName['6_MSBEightBit'] */,
            '25': "6_MSBMiddleEightBit" /* EightBitChunkName['6_MSBMiddleEightBit'] */,
            '26': "6_LSBMiddleEightBit" /* EightBitChunkName['6_LSBMiddleEightBit'] */,
            '27': "6_LSBEightBit" /* EightBitChunkName['6_LSBEightBit'] */,
            '28': "7_MSBEightBit" /* EightBitChunkName['7_MSBEightBit'] */,
            '29': "7_MSBMiddleEightBit" /* EightBitChunkName['7_MSBMiddleEightBit'] */,
            '30': "7_LSBMiddleEightBit" /* EightBitChunkName['7_LSBMiddleEightBit'] */,
            '31': "7_LSBEightBit" /* EightBitChunkName['7_LSBEightBit'] */
        };
        this.gameLogic = gameLogic;
        this.bitAllocationConfig = JSON.parse(fs.readFileSync('configurations/data.json', 'utf8'));
        this.bitAllocationConfigNames = this.bitAllocationConfig.map((bitAllocation) => bitAllocation.name);
        this.inputEventNames = JSON.parse(fs.readFileSync('configurations/input.json', 'utf8'));
        this.validateBitAllocation();
        this.oscHandler = new osc_1.default.UDPPort({
            localAddress: this.url,
            localPort: this.vrChatUdpReceiverPort,
            remotePort: this.vrChatUdpSenderPort,
            metadata: false
        });
        this.oscHandler.on('message', this.onMessageRecived.bind(this));
        this.oscHandler.open();
        this.updateVrc();
    }
    positionToBits(val, size) {
        return val & (Math.pow(2, size) - 1);
    }
    replaceAt(string, index, replacement) {
        return string.substr(0, index) + replacement + string.substr(index + replacement.length);
    }
    piecePositionsToEightBitChunks(gameState) {
        const chunkedBits = this.getAllocatedBits('noOverflow');
        let positionBitsString = ''.padStart(this.getAllocatedBitsSize(chunkedBits), '0');
        let currentIndex = 0;
        for (const bitAllocation of chunkedBits) {
            const positionBits = this.positionToBits(gameState[bitAllocation.name], bitAllocation.size).toString(2).padStart(bitAllocation.size, '0');
            positionBitsString = this.replaceAt(positionBitsString, currentIndex, positionBits);
            currentIndex += bitAllocation.size;
        }
        const bytes = [];
        for (let i = 0; i < positionBitsString.length; i += 8) {
            const byteString = positionBitsString.substring(i, i + 8).padEnd(8, '0');
            bytes.push({ name: this.bitIndexToEightBitName[`${i}`], value: parseInt(byteString, 2) });
        }
        return bytes;
    }
    onMessageRecived(oscMsg, _timeTag, _info) {
        if (!oscMsg.address.includes('!') || Date.now() - this.lastMessageDate < this.messageDelayMs) {
            return;
        }
        const eventType = oscMsg.address.split('!')[1];
        this.lastMessageDate = Date.now();
        if (this.inputEventNames.includes(eventType)) {
            if (oscMsg.args[0] === false) {
                return;
            }
            const handleChessInputMessage = this.gameLogic.handleInput(eventType);
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
    updateVrc() {
        const gameState = this.gameLogic.getState();
        const missingBitAllocationConfigNames = this.bitAllocationConfigNames.filter((name) => !Object.keys(gameState).includes(name)).join(", ");
        if (missingBitAllocationConfigNames !== "") {
            throw new Error(missingBitAllocationConfigNames);
        }
        this.piecePositionsToEightBitChunks(gameState).forEach((byte) => {
            this.sendUdpMessage(`${byte.name}`, [{ type: 'i', value: byte.value }]);
        });
        this.getAllocatedBits('overflow').forEach((bitAllocation) => {
            this.sendUdpMessage(`${bitAllocation.startName}`, [{ type: 'i', value: gameState[bitAllocation.name] }]);
        });
    }
    sendVrchatboxMessage(message) {
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
    sendUdpMessage(subAddress, args, url = '127.0.0.1', port = 9000) {
        this.oscHandler.send({
            address: `/avatar/parameters/${subAddress}`,
            args: args
        }, url, port);
    }
    validateBitAllocation() {
        let startIndex = 0;
        this.bitAllocations = this.bitAllocationConfig.map((bitAllocation) => {
            const range = { start: startIndex, end: startIndex + bitAllocation.size };
            const res = Object.assign(Object.assign({}, bitAllocation), { range: range, startName: this.bitIndexToEightBitName[((range.start - range.start % 8) / 8)], endName: this.bitIndexToEightBitName[((range.start - range.start % 8) / 8) + 1], bitIndex: 0 // TODO implement this
             });
            startIndex += bitAllocation.size;
            return res;
        });
        const allocatedBitsSize = this.getAllocatedBitsSize(this.bitAllocations);
        const oveflowBits = allocatedBitsSize % 8;
        let overflowNumber = 1;
        if (oveflowBits !== 0) {
            for (let i = this.bitAllocations.length - oveflowBits; i < this.bitAllocations.length; i++) {
                this.bitAllocations[i].startName = `Overflow_bit_${overflowNumber}`;
                this.bitAllocations[i].endName = `Overflow_bit_${overflowNumber}`;
                overflowNumber++;
            }
        }
        if (allocatedBitsSize > 256) {
            console.error(`Too many bits allocated (limit 256): ${allocatedBitsSize}`);
            throw new Error(`Too many bits allocated (limit 256): ${allocatedBitsSize}`);
        }
        fs.writeFileSync("auto_generated_files/data_mapped.json", JSON.stringify(this.bitAllocations, null, 2));
    }
    getAllocatedBits(includeOverflow) {
        switch (includeOverflow) {
            case 'all': return this.bitAllocations;
            case 'overflow': return this.bitAllocations.filter((bitAllocation) => bitAllocation.name.includes("Overflow"));
            case 'noOverflow': return this.bitAllocations.filter((bitAllocation) => !bitAllocation.name.includes("Overflow"));
        }
    }
    getAllocatedBitsSize(bitAllocation) {
        return bitAllocation.reduce((accumulator, obj) => accumulator += obj.size, 0);
    }
}
const oscVrchat = new OSCVrChat(new ChessGame());
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
//# sourceMappingURL=index.js.map