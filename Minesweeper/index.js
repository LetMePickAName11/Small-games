// HTML references
const boardContainerElementRef = document.getElementById("boardContainer");
const scoreElementRef = document.getElementById("score");
const bombCountElementRef = document.getElementById("bombCount");
const resetBtnElementRef = document.getElementById("resetBtn");
const confettiElementRef = document.getElementById("confetti");
const bombTileElementRefs = boardContainerElementRef.children;



class Minesweeper {
  boardDimension = 50;
  bombRate = 0.05;
  tileSize = 25;

  score = 0;
  bombCount = 0;
  lost = false;
  won = false;
  firstClick = true;

  constructor(boardDimension, bombRate, tileSize) {
    this.boardDimension = boardDimension;
    this.bombRate = bombRate;
    this.tileSize = tileSize;

    scoreElementRef.innerText = "Score: 0";
    bombCountElementRef.innerText = "Bomb count:";
    boardContainerElementRef.innerHTML = "";
    confettiElementRef.innerHTML = "";

    this.createBoard();
    this.addTileListeners();
  }

  createBoard() {
    // Set the board with and height based on dimensions provided
    boardContainerElementRef.style.width = `${this.boardDimension * this.tileSize}px`;
    boardContainerElementRef.style.height = `${this.boardDimension * this.tileSize}px`;

    let boardChildElements = "";
    for (let i = 0; i < this.boardDimension; i++) {
      for (let j = 0; j < this.boardDimension; j++) {
        boardChildElements += `<div id="${i}-${j}" style="height: ${this.tileSize}px; width: ${this.tileSize}px; font-size: ${this.tileSize}px; border: 1px solid black; box-sizing: border-box; cursor: pointer; user-select: none; display: flex; justify-content: center; align-items: center;"></div>`;
      }
    }

    boardContainerElementRef.innerHTML = boardChildElements;
  }

  addBombs(index) {
    for (let i = 0; i < bombTileElementRefs.length; i++) {
      const bombTile = bombTileElementRefs[i];

      if (i === index) {
        bombTile["isBomb"] = false;
      }
      else {
        bombTile["isBomb"] = Math.random() > 1 - this.bombRate;
        this.updateBombCount(bombTile["isBomb"]);
      }
    }

    for (let i = 0; i < bombTileElementRefs.length; i++) {
      const bombTile = bombTileElementRefs[i];

      const rowIndex = Math.floor(i / this.boardDimension);
      const colIndex = i % this.boardDimension;

      const topLeft = this.getNeighborValue(rowIndex - 1, colIndex - 1);
      const topMiddle = this.getNeighborValue(rowIndex - 1, colIndex);
      const topRight = this.getNeighborValue(rowIndex - 1, colIndex + 1);
      const middleLeft = this.getNeighborValue(rowIndex, colIndex - 1);
      const middleRight = this.getNeighborValue(rowIndex, colIndex + 1);
      const bottomLeft = this.getNeighborValue(rowIndex + 1, colIndex - 1);
      const bottomMiddle = this.getNeighborValue(rowIndex + 1, colIndex);
      const bottomRight = this.getNeighborValue(rowIndex + 1, colIndex + 1);

      bombTile["bombCount"] = topLeft + topMiddle + topRight + middleLeft + middleRight + bottomLeft + bottomMiddle + bottomRight;
    }
  }

  addTileListeners() {
    for (let i = 0; i < bombTileElementRefs.length; i++) {
      const bombTile = bombTileElementRefs[i];

      // Stop right click from opening the context menu
      bombTile.addEventListener("contextmenu", (contextMenuEvent) => {
        contextMenuEvent.preventDefault();
        contextMenuEvent.stopPropagation();
      });

      bombTile.addEventListener("mousedown", (mousedownEvent) => {
        if (this.firstClick) {
          this.firstClick = false;
          this.addBombs(i);
        }

        if (bombTile["seen"] || this.lost || this.won) {
          return;
        }

        if (mousedownEvent.button === 0 && !bombTile["flag"]) {
          this.onLeftClick(bombTile);
        }
        else if (mousedownEvent.button === 2) {
          this.onRightClick(bombTile);
        }

        this.won = (this.getCurrentBombCount() === 0) && ((this.score) === (this.boardDimension * this.boardDimension)) && !this.lost;
        this.handleWin();
      });
    }
  }

  showEntireBoard() {
    for (let i = 0; i < bombTileElementRefs.length; i++) {
      const bombTile = bombTileElementRefs[i];
      bombTile.innerHTML = bombTile["bombCount"];
      bombTile.style.color = bombTile["isBomb"] ? "red" : "green";
    }
  }

  onLeftClick(bombTile) {
    bombTile.innerHTML = bombTile["bombCount"];
    bombTile.style.color = bombTile["isBomb"] ? "red" : "green";

    bombTile["seen"] = true;

    if (bombTile["isBomb"]) {
      this.lost = true;
      this.showEntireBoard();
    }
    else{
      this.updateScore(1);
    }
  }

  onRightClick(bombTile) {
    bombTile["flag"] = !bombTile["flag"];
    bombTile.innerHTML = bombTile["flag"] ? '?' : '';

    this.updateBombCount(-this.boolToInt(bombTile["flag"]));
    this.updateScore(this.boolToInt(bombTile["flag"]));
  }

  handleWin(){
    if(!this.won){
      return;
    }

    confettiElementRef.innerHTML = new Array(25).fill(`<div class="confetti-piece"></div>`).join("");
  }

  // Helper functions
  getNeighborValue(rowIndex, colIndex) {
    // Check if the given indices are within bounds
    if (rowIndex >= 0 && rowIndex < this.boardDimension && colIndex >= 0 && colIndex < this.boardDimension) {
      // Access the bombTileElementRefs array only if the indices are valid
      return bombTileElementRefs[rowIndex * this.boardDimension + colIndex]["isBomb"];
    }
    return 0; // Default value for out-of-bounds cells
  }

  // valueToAdd is either 1 or -1
  updateScore(valueToAdd) {
    this.score += valueToAdd;
    scoreElementRef.innerText = `Score: ${this.score}`;
  }

  updateBombCount(valueToAdd) {
    this.bombCount += valueToAdd;
    bombCountElementRef.innerText = `Bomb count: ${this.bombCount}`;
  }

  getCurrentBombCount() {
    return Number(bombCountElementRef.innerText.split(/Bomb\ count\: /)[1]);
  }

  boolToInt(bool) {
    return bool ? 1 : -1;
  }
}


let game;

resetBtnElementRef.addEventListener("click", () => {
  game = new Minesweeper(10, 0.25, 50);
});

resetBtnElementRef.click();