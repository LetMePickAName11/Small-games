// HTML references
const boardContainerElementRef = document.getElementById("boardContainer");
const nextPieceElementRef = document.getElementById("nextPiece");
const scoreElementRef = document.getElementById("score");
const resetBtnElementRef = document.getElementById("resetBtn");

const canvasCtx = boardContainerElementRef.getContext("2d");
const canvasHintCtx = nextPieceElementRef.getContext("2d");

class Tetris {
  score = 0;
  lost = false;

  // Game variables
  height;
  width;
  tickSpeed;

  tileWidth;
  tileHeight;
  // Update time tracker
  lastTick;

  // Tetris information
  direction = Direction.None;
  gracePeriode = false;

  // 10 wide 20 tall
  currentPiece = Piece.empty(0, 0);
  nextPiece = Piece.empty(0, 0);
  ghostPiece = Piece.empty(0, 0);
  board = [];


  constructor() {
    // Setup game board settings
    this.height = 640;
    this.width = 320;
    this.tickSpeed = 500;
    this.ratioX = 10;
    this.ratioY = 20;

    this.tileWidth = (this.width / this.ratioX);
    this.tileHeight = (this.height / this.ratioY);

    scoreElementRef.innerText = "Score: 0";
    boardContainerElementRef.width = this.width;
    boardContainerElementRef.height = this.height;
    nextPieceElementRef.width = 256;
    nextPieceElementRef.height = 256;

    this.createBoard();
    this.addEventListeners();
    this.spawnPiece();
    this.lastTick = Date.now();
    this.update();
  }

  createBoard() {
    for (let x = 0; x < this.ratioX; x++) {
      for (let y = 0; y < this.ratioY; y++) {
        this.board.push(Piece.empty(x, y));
      }
    }
  }

  addEventListeners() {
    addEventListener("keydown", (event) => {
      this.direction = Direction[event.key] ?? this.direction;

      if (event.key === Direction.ArrowUp) {
        this.currentPiece.rotate(this.board);
      }
      else if (event.key === Direction.ArrowRight) {
        this.moveX(this.currentPiece, 1);
      }
      else if (event.key === Direction.ArrowLeft) {
        this.moveX(this.currentPiece, -1);
      }
    });
  }

  update() {
    this.ghostPiece.x = this.currentPiece.x;
    this.ghostPiece.y = this.currentPiece.y;
    this.updateGhostPiece();
    this.draw();

    // If lost break out of loop
    if (this.lost) {
      return console.log("lost");
    }
    // If spacebar pressed drop piece instantly and spawn new piece
    if (this.direction === " ") {
      this.dropPiece();
      this.movePieceToBoard();
      this.checkForTetris();
      this.spawnPiece();
      this.checkLooseCondition();
      this.gracePeriode = false;
    } // Else if not next tick wait
    else if (Date.now() - this.lastTick < this.tickSpeed) {
      return requestAnimationFrame(this.update.bind(this));;
    } // Else if graceperiode ignore user input
    else if (this.gracePeriode) {
      if (this.checkIfPieceHit()) {
        this.movePieceToBoard();
        this.checkForTetris();
        this.spawnPiece();
        this.checkLooseCondition();
      }
      else {
        this.acceleratePiece();
      }

      this.gracePeriode = false;
    }
    else {
      if (this.direction === Direction.ArrowDown) {
        this.acceleratePiece();
      }

      this.acceleratePiece();
      this.gracePeriode = this.checkIfPieceHit();
    }

    this.lastTick = Date.now();
    this.direction = Direction.None;

    requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    canvasCtx.clearRect(0, 0, boardContainerElementRef.width, boardContainerElementRef.height);
    canvasHintCtx.clearRect(0, 0, boardContainerElementRef.width, boardContainerElementRef.height);

    for (let i = 0; i < this.board.length; i++) {
      const piece = this.board[i];
      this.drawHelper(piece.x, piece.y, piece.color);
    }

    for (let i = 0; i < this.ghostPiece.parts.length; i++) {
      this.drawHelper(this.ghostPiece.getPartX(i), this.ghostPiece.getPartY(i), "black");
    }

    for (let i = 0; i < this.currentPiece.parts.length; i++) {
      this.drawHelper(this.currentPiece.getPartX(i), this.currentPiece.getPartY(i), this.currentPiece.color);
    }

    for (let i = 0; i < this.nextPiece.parts.length; i++) {
      this.drawHelperTwo(this.nextPiece.getPartX(i), this.nextPiece.getPartY(i), this.nextPiece.color);
    }
  }

  dropPiece() {
    let pieceHit = false;

    for (let i = 0; i < this.currentPiece.parts.length; i++) {
      const pieceBelow = this.board.find(p => p.x === this.currentPiece.getPartX(i) && p.y === (this.currentPiece.getPartY(i) + 1));
      if (pieceBelow === undefined || pieceBelow.pieceSymbol !== "e") {
        pieceHit = true;
        break;
      }
    }

    if (pieceHit) {
      return;
    }

    this.currentPiece.y += 1;
    this.dropPiece();
  }

  acceleratePiece() {
    let pieceHit = false;

    for (let i = 0; i < this.currentPiece.parts.length; i++) {
      const pieceBelow = this.board.find(p => p.x === this.currentPiece.getPartX(i) && p.y === (this.currentPiece.getPartY(i) + 1));
      if (pieceBelow === undefined || pieceBelow.pieceSymbol !== "e") {
        pieceHit = true;
        break;
      }
    }

    if (pieceHit) {
      return;
    }

    this.currentPiece.y += 1;
  }

  movePieceToBoard() {
    for (let i = 0; i < this.currentPiece.parts.length; i++) {
      const index = this.board.findIndex(p => p.x === this.currentPiece.getPartX(i) && p.y === this.currentPiece.getPartY(i));
      this.board[index] = this.currentPiece.clone(this.board[index]);
    }
  }

  checkIfPieceHit() {
    for (let i = 0; i < this.currentPiece.parts.length; i++) {
      const pieceBelow = this.board.find(p => p.x === this.currentPiece.getPartX(i) && p.y === (this.currentPiece.getPartY(i) + 1));

      if (pieceBelow === undefined || pieceBelow.pieceSymbol !== "e") {
        return true;
      }
    }

    return false;
  }

  checkForTetris() {
    let moveLinesDown = false;

    for (let y = this.ratioY - 1; y >= 0; y--) {
      let tetris = true;
      if (moveLinesDown) {
        for (let x = 0; x < this.ratioX; x++) {
          const a = this.board.findIndex(b => b.x === x && b.y === y)
          const b = this.board.findIndex(b => b.x === x && b.y === y + 1)
          this.board[b] = this.board[a];
          this.board[b].y += 1;
          this.board[a] = Piece.empty(x, y);
        }
      }
      else {
        for (let x = 0; x < this.ratioX; x++) {
          if (this.board.find(b => b.x === x && b.y === y).pieceSymbol === "e") {
            tetris = false;
            break;
          }
        }

        if (tetris) {
          this.score += 1;
          scoreElementRef.innerText = `Score: ${this.score}`;
          moveLinesDown = true;

          for (let x = 0; x < this.ratioX; x++) {
            const index = this.board.findIndex(b => b.x === x && b.y === y);
            this.board[index] = Piece.empty(this.board[index].x, this.board[index].y);
          }
        }
      }
    }

    if (moveLinesDown) {
      this.checkForTetris();
    }
  }

  spawnPiece() {
    if (this.nextPiece.pieceSymbol === "e") {
      switch (5){//this.getRandomInt(7)) {
        case 0: this.nextPiece = Piece.square(3, 3); break;
        case 1: this.nextPiece = Piece.line(3, 3); break;
        case 2: this.nextPiece = Piece.t(3, 3); break;
        case 3: this.nextPiece = Piece.s(3, 3); break;
        case 4: this.nextPiece = Piece.z(3, 3); break;
        case 5: this.nextPiece = Piece.l(3, 3); break;
        case 6: this.nextPiece = Piece.j(3, 3); break;
      }
    }

    this.currentPiece = this.nextPiece.cloneFull({ x: 4, y: 0 });

    switch (5){//(this.getRandomInt(7)) {
      case 0: this.nextPiece = Piece.square(3, 3); break;
      case 1: this.nextPiece = Piece.line(3, 3); break;
      case 2: this.nextPiece = Piece.t(3, 3); break;
      case 3: this.nextPiece = Piece.s(3, 3); break;
      case 4: this.nextPiece = Piece.z(3, 3); break;
      case 5: this.nextPiece = Piece.l(3, 3); break;
      case 6: this.nextPiece = Piece.j(3, 3); break;
    }


    this.ghostPiece = this.currentPiece.cloneFull({ x: 4, y: 0 });
  }

  moveX(piece, newValue) {
    let invalidMove = false;
    for (let i = 0; i < piece.parts.length; i++) {
      const newX = piece.getPartX(i) + newValue;

      if (newX < 0 || newX >= this.ratioX) {
        invalidMove = true;
        break;
      }
    }

    const newPos = piece.parts.map(p => p.clone());
    newPos[0].x += newValue;
    newPos[1].x += newValue;
    newPos[2].x += newValue;
    newPos[3].x += newValue;

    if (!invalidMove && !piece.testNewPosition(this.board, newPos)) {
      piece.x += newValue;
    }
  }

  moveY(piece, newValue) {
    let invalidMove = false;
    for (let i = 0; i < piece.parts.length; i++) {
      const newY = piece.getPartY(i) + newValue;

      if (newY < 0 || newY >= this.ratioY) {
        invalidMove = true;
        break;
      }
    }

    if (!invalidMove) {
      piece.y += newValue;
    }
  }

  updateGhostPiece() {
    let pieceHit = false;

    for (let i = 0; i < this.ghostPiece.parts.length; i++) {
      const pieceBelow = this.board.find(p => p.x === this.ghostPiece.getPartX(i) && p.y === (this.ghostPiece.getPartY(i) + 1));

      if (pieceBelow === undefined || pieceBelow.pieceSymbol !== "e") {
        pieceHit = true;
        break;
      }
    }

    if (pieceHit) {
      return;
    }

    this.ghostPiece.y += 1;
    this.updateGhostPiece();
  }

  checkLooseCondition() {
    for (let i = 0; i < this.currentPiece.parts.length; i++) {
      const bpiece = this.board.find(b => b.x === this.currentPiece.getPartX(i) && b.y === this.currentPiece.getPartY(i))

      if (bpiece.pieceSymbol !== 'e') {
        this.lost = true;
        break;
      }
    }
  }

  drawHelper(x, y, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
    canvasCtx.fillStyle = "grey";
    canvasCtx.strokeRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
  }

  drawHelperTwo(x, y, color) {
    canvasHintCtx.fillStyle = color;
    canvasHintCtx.fillRect(x * this.tileWidth, y * this.tileHeight, 32, 32);
    canvasHintCtx.fillStyle = "grey";
    canvasHintCtx.strokeRect(x * this.tileWidth, y * this.tileHeight, 32, 32);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}

class Piece {
  color = "";
  parts = [];
  pieceSymbol = "";
  x = -1;
  y = -1;
  rotation = "up";

  constructor(color, parts, pieceSymbol, x, y) {
    this.color = color;
    this.parts = parts;
    this.pieceSymbol = pieceSymbol;
    this.x = x;
    this.y = y;
  }

  static empty(x, y) {
    return new Piece("white", [], "e", x, y);
  }

  static square(x, y) {
    return new Piece("grey", [new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(1, 1)], "o", x, y);
  }

  static line(x, y) {
    return new Piece("teal", [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)], "i", x, y);
  }

  static t(x, y) {
    return new Piece("purple", [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(1, 1)], "t", x, y);
  }

  static s(x, y) {
    return new Piece("red", [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(2, 0)], "s", x, y);
  }

  static z(x, y) {
    return new Piece("green", [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(2, 1)], "z", x, y);
  }

  static l(x, y) {
    return new Piece("orange", [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2)], "l", x, y);
  }

  static j(x, y) {
    return new Piece("pink", [new Point(1, 0), new Point(1, 1), new Point(1, 2), new Point(0, 2)], "j", x, y);
  }

  rotate(board) {
    if (this.pieceSymbol === "o") {
      return;
    }

    switch (this.rotation) {
      case "up": this.rotation = "right"; break;
      case "right": this.rotation = "down"; break;
      case "down": this.rotation = "left"; break;
      case "left": this.rotation = "up"; break;
    }

    let newPositions = [];

    if (this.pieceSymbol === "i") {
      newPositions[0] = this.rotation === "up" ? new Point(0, 0) : this.rotation === "right" ? new Point(0, 0) : this.rotation === "down" ? new Point(0, 0) : new Point(0, 0);
      newPositions[1] = this.rotation === "up" ? new Point(1, 0) : this.rotation === "right" ? new Point(0, 1) : this.rotation === "down" ? new Point(1, 0) : new Point(0, 1);
      newPositions[2] = this.rotation === "up" ? new Point(2, 0) : this.rotation === "right" ? new Point(0, 2) : this.rotation === "down" ? new Point(2, 0) : new Point(0, 2);
      newPositions[3] = this.rotation === "up" ? new Point(3, 0) : this.rotation === "right" ? new Point(0, 3) : this.rotation === "down" ? new Point(3, 0) : new Point(0, 3);
    }

    if (this.pieceSymbol === "t") {
      newPositions[0] = this.rotation === "up" ? new Point(0, 0) : this.rotation === "right" ? new Point(1, 0) : this.rotation === "down" ? new Point(0, 0) : new Point(1, 0);
      newPositions[1] = this.rotation === "up" ? new Point(1, 0) : this.rotation === "right" ? new Point(1, 1) : this.rotation === "down" ? new Point(1, 0) : new Point(1, 1);
      newPositions[2] = this.rotation === "up" ? new Point(2, 0) : this.rotation === "right" ? new Point(1, 2) : this.rotation === "down" ? new Point(2, 0) : new Point(1, 2);
      newPositions[3] = this.rotation === "up" ? new Point(1, 1) : this.rotation === "right" ? new Point(0, 1) : this.rotation === "down" ? new Point(1, -1) : new Point(2, 1);
    }

    if (this.pieceSymbol === "s") {
      newPositions[0] = this.rotation === "up" ? new Point(0, 1) : this.rotation === "right" ? new Point(1, 0) : this.rotation === "down" ? new Point(0, 1) : new Point(0, 0);
      newPositions[1] = this.rotation === "up" ? new Point(1, 1) : this.rotation === "right" ? new Point(1, 1) : this.rotation === "down" ? new Point(1, 1) : new Point(0, 1);
      newPositions[2] = this.rotation === "up" ? new Point(1, 0) : this.rotation === "right" ? new Point(2, 1) : this.rotation === "down" ? new Point(1, 0) : new Point(1, 1);
      newPositions[3] = this.rotation === "up" ? new Point(2, 0) : this.rotation === "right" ? new Point(2, 2) : this.rotation === "down" ? new Point(2, 0) : new Point(1, 2);
    }

    if (this.pieceSymbol === "z") {
      newPositions[0] = this.rotation === "up" ? new Point(0, 0) : this.rotation === "right" ? new Point(1, 0) : this.rotation === "down" ? new Point(0, 0) : new Point(1, 0);
      newPositions[1] = this.rotation === "up" ? new Point(1, 0) : this.rotation === "right" ? new Point(1, 1) : this.rotation === "down" ? new Point(1, 0) : new Point(1, 1);
      newPositions[2] = this.rotation === "up" ? new Point(1, 1) : this.rotation === "right" ? new Point(0, 1) : this.rotation === "down" ? new Point(1, 1) : new Point(0, 1);
      newPositions[3] = this.rotation === "up" ? new Point(2, 1) : this.rotation === "right" ? new Point(0, 2) : this.rotation === "down" ? new Point(2, 1) : new Point(0, 2);
    }

    if (this.pieceSymbol === "l") {
      newPositions[0] = this.rotation === "up" ? new Point(0, 0) : this.rotation === "right" ? new Point(-1, 1) : this.rotation === "down" ? new Point(-1, 0) : new Point(-1, 0);
      newPositions[1] = this.rotation === "up" ? new Point(0, 1) : this.rotation === "right" ? new Point(-1, 0) : this.rotation === "down" ? new Point(0, 0) : new Point(0, 0);
      newPositions[2] = this.rotation === "up" ? new Point(0, 2) : this.rotation === "right" ? new Point(0, 0) : this.rotation === "down" ? new Point(0, 1) : new Point(1, 0);
      newPositions[3] = this.rotation === "up" ? new Point(1, 2) : this.rotation === "right" ? new Point(1, 0) : this.rotation === "down" ? new Point(0, 2) : new Point(1, -1);
    }

    if (this.pieceSymbol === "j") {
      newPositions[0] = this.rotation === "up" ? new Point(1, 0) : this.rotation === "right" ? new Point(0, 0) : this.rotation === "down" ? new Point(1, 0) : new Point(0, 1);
      newPositions[1] = this.rotation === "up" ? new Point(1, 1) : this.rotation === "right" ? new Point(0, 1) : this.rotation === "down" ? new Point(1, 1) : new Point(1, 1);
      newPositions[2] = this.rotation === "up" ? new Point(1, 2) : this.rotation === "right" ? new Point(1, 1) : this.rotation === "down" ? new Point(1, 2) : new Point(2, 1);
      newPositions[3] = this.rotation === "up" ? new Point(0, 2) : this.rotation === "right" ? new Point(2, 1) : this.rotation === "down" ? new Point(2, 0) : new Point(2, 2);
    }

    if (this.testNewPosition(board, newPositions)) {
      switch (this.rotation) {
        case "up": this.rotation = "left"; break;
        case "right": this.rotation = "up"; break;
        case "down": this.rotation = "right"; break;
        case "left": this.rotation = "down"; break;
      }
      return;
    }

    this.parts[0] = newPositions[0];
    this.parts[1] = newPositions[1];
    this.parts[2] = newPositions[2];
    this.parts[3] = newPositions[3];
  }

  getPartX(index) {
    return this.parts[index].x + this.x;
  }

  getPartY(index) {
    return this.parts[index].y + this.y;
  }

  clone(replaced) {
    return new Piece(this.color, [], this.pieceSymbol, replaced.x, replaced.y);
  }

  cloneFull(replaced) {
    return new Piece(this.color, this.parts, this.pieceSymbol, replaced.x, replaced.y);
  }

  // true === invalid move | false === valid move
  testNewPosition(board, newPositions) {
    const fir = board.find(b => b.x === (newPositions[0].x + this.x) && b.y === (newPositions[0].y + this.y));
    const sec = board.find(b => b.x === (newPositions[1].x + this.x) && b.y === (newPositions[1].y + this.y));
    const thi = board.find(b => b.x === (newPositions[2].x + this.x) && b.y === (newPositions[2].y + this.y));
    const fort = board.find(b => b.x === (newPositions[3].x + this.x) && b.y === (newPositions[3].y + this.y));

    return (fir === undefined || sec === undefined || thi === undefined || fort === undefined || fir.pieceSymbol !== "e" || sec.pieceSymbol !== "e" || thi.pieceSymbol !== "e" || fort.pieceSymbol !== "e");
  }
}

class Point {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  clone() {
    return new Point(this.x, this.y);
  }
}

const Direction = {
  "None": "None",
  "ArrowDown": "ArrowDown",
  "ArrowUp": "ArrowUp",
  "ArrowRight": "ArrowRight",
  "ArrowLeft": "ArrowLeft",
  " ": " "
};


let game;

resetBtnElementRef.addEventListener("click", () => {
  game = new Tetris();
});

resetBtnElementRef.click();