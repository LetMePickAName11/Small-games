// HTML references
const boardContainerElementRef = document.getElementById("boardContainer");
const resetBtnElementRef = document.getElementById("resetBtn");
const confettiElementRef = document.getElementById("confetti");
const clueAmountRef = document.getElementById("clueAmount");
const numberSelectedRef = document.getElementById("numberSelected");
const useAutoSolverRef = document.getElementById("useAutoSolver");
const sudokuTileElementRefs = boardContainerElementRef.children;

const boardStates = [
  [
    4, 9, 8, 1, 7, 2, 6, 3, 5,
    7, 5, 3, 8, 9, 6, 4, 2, 1,
    6, 2, 1, 3, 5, 4, 8, 9, 7,
    9, 1, 7, 6, 2, 3, 5, 4, 8,
    8, 3, 5, 7, 4, 1, 2, 6, 9,
    2, 6, 4, 5, 8, 9, 1, 7, 3,
    3, 8, 6, 2, 1, 7, 9, 5, 4,
    1, 4, 2, 9, 3, 5, 7, 8, 6,
    5, 7, 9, 4, 6, 8, 3, 1, 2
  ],
  // Insert next solution here
];


class AutoSolver {
  solution = [];
  cellData = [
    {
      id: 0,
      rowId: 0,
      colId: 0,
      chunkId: 0,
      clue: false,
      value: -1,
      possibleValues: [],
    }
  ]

  constructor(solution, clues) {
    this.solution = solution;

    this.cellData = clues.map((val, ind) => {
      const rowId = Math.floor(ind / 9);
      const colId = ind % 9;
      const chunkId = 3 * Math.floor(rowId / 3) + Math.floor(colId / 3);

      return {
        id: ind,
        rowId: rowId,
        colId: colId,
        chunkId: chunkId,
        clue: val !== -1,
        value: val,
        possibleValues: val !== -1 ? null : [1, 2, 3, 4, 5, 6, 7, 8, 9],
      };
    });
  }

  // 0-8
  getRow(rowId) {
    return this.cellData.filter(v => v.rowId === rowId);
  }
  getColumn(colId) {
    return this.cellData.filter(v => v.colId === colId);
  }
  getChunk(chunkId) {
    return this.cellData.filter(v => v.chunkId === chunkId);
  }

  updatePlayerSolution(index, value){
    this.cellData[index].value = value;
    this.cellData[index].possibleValues = null;
  }

  solve() {
    // If every cell has been filled out stop
    if (this.cellData.every(v => v.value !== -1)) {
      for (let i = 0; i < this.cellData.length; i++) {
        const cell = this.cellData[i];
        // Update game board
        dispatchEvent(new KeyboardEvent('keyup', { key: `${cell.value}` }));
        sudokuTileElementRefs[cell.id].dispatchEvent(new MouseEvent('mousedown'));
      }

      return;
    }

    // Simple row, column and chunk comparison
    for (let i = 0; i < this.cellData.length; i++) {
      const cell = this.cellData[i];

      if (cell.value !== -1) {
        continue;
      }

      const usedNumbers = [
        ...this.getRow(cell.rowId).map(c => c.value),
        ...this.getColumn(cell.colId).map(c => c.value),
        ...this.getChunk(cell.chunkId).map(c => c.value)
      ];
      const usedNumbersNoDub = Array(...new Set(usedNumbers)).filter(v => v !== -1);

      cell.possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !usedNumbersNoDub.includes(v));

      if (cell.possibleValues.length === 1) {
        this.updatePlayerSolution(cell.id, cell.possibleValues[0]);

        // Temp for debugging
        dispatchEvent(new KeyboardEvent('keyup', { key: `${cell.value}` }));
        sudokuTileElementRefs[cell.id].dispatchEvent(new MouseEvent('mousedown'));
        

        return this.solve();
      }
    }

    let nakedPairFound = false;

    // Naked pairs
    for (let i = 0; i < this.cellData.length; i++) {
      const cell = this.cellData[i];
      // Only check if value has not been set and possible values length is 2
      if (cell.value !== -1 || cell.possibleValues.length !== 2) {
        continue;
      }
      // Get current row without the current cell
      const rowCells = this.getRow(cell.rowId).filter(c => c.id !== cell.id);
      // Used to keep track if we have found a pair cell
      let pairCell;

      // Interate through each cell in row and check if they have indentical possible values
      for (let j = 0; j < rowCells.length; j++) {
        const rowCell = rowCells[j];
        // Check if possible values array contains 2 elements
        if (rowCell.possibleValues.length !== 2) {
          continue;
        }
        // Check if they have the same values and break out of checking row (there can only be one pair)
        if (cell.possibleValues.every(pv => rowCell.possibleValues.includes(pv))) {
          pairCell = rowCell;
          break;
        }
      }
      // Continue seaching if a pair was found
      if (pairCell !== undefined) {
        // Remove naked pair possible values from the rest of the row and also exclude the pair cell (we have already excluded current cell earlier)
        for (const rowCell of rowCells.filter(rc => rc.id !== pairCell.id)) {
          rowCell.possibleValues = rowCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
        // Set nakedPairFound flag so we can call Solve() recursively afterwards
        nakedPairFound = true;
        // Continue to next cell, there can only be one naked pair per row/column/chunk
        continue;
      }

      // Get current column without the current cell
      const columnCells = this.getColumn(cell.colId).filter(c => c.id !== cell.id);
      // Interate through each cell in column and check if they have indentical possible values
      for (let j = 0; j < columnCells.length; j++) {
        const columnCell = columnCells[j];
        // Check if possible values array contains 2 elements
        if (columnCell.possibleValues.length !== 2) {
          continue;
        }
        // Check if they have the same values and break out of checking column (there can only be one pair)
        if (cell.possibleValues.every(pv => columnCell.possibleValues.includes(pv))) {
          pairCell = columnCell;
          break;
        }
      }
      // Continue seaching if a pair was found
      if (pairCell !== undefined) {
        // Remove naked pair possible values from the rest of the column and also exclude the pair cell (we have already excluded current cell earlier)
        for (const columnCell of columnCells.filter(cc => cc.id !== pairCell.id)) {
          columnCell.possibleValues = columnCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
        // Set nakedPairFound flag so we can call Solve() recursively afterwards
        nakedPairFound = true;
        // Continue to next cell, there can only be one naked pair per row/column/chunk
        continue;
      }
      
      // Get current chunk without the current cell
      const chunkCells = this.getChunk(cell.chunkId).filter(c => c.id !== cell.id);
      // Interate through each cell in chunk and check if they have indentical possible values
      for (let j = 0; j < chunkCells.length; j++) {
        const chunkCell = chunkCells[j];
        // Check if possible values array contains 2 elements
        if (chunkCell.possibleValues.length !== 2) {
          continue;
        }
        // Check if they have the same values and break out of checking chunk (there can only be one pair)
        if (cell.possibleValues.every(pv => chunkCell.possibleValues.includes(pv))) {
          pairCell = chunkCell;
          break;
        }
      }
      // Continue seaching if a pair was found
      if (pairCell !== undefined) {
        // Remove naked pair possible values from the rest of the chunk and also exclude the pair cell (we have already excluded current cell earlier)
        for (const chunkCell of chunkCells.filter(cc => cc.id !== pairCell.id)) {
          chunkCell.possibleValues = chunkCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
        // Set nakedPairFound flag so we can call Solve() recursively afterwards
        nakedPairFound = true;
      }
    }

    if (nakedPairFound) {
      return this.solve();
    }
  }
}

class Sudoku {
  boardDimension = 9;
  tileSize = 50; // Each tile/cell size in px
  solution = [];
  playerBoard = [];
  selectedNumber = 1; // 1-9
  clueAmount = 40; // 0-81

  won = false;

  boundEventHandler;

  constructor() {
    boardContainerElementRef.innerHTML = "";
    confettiElementRef.innerHTML = "";
    this.clueAmount = clueAmountRef.value;

    this.createBoard();

    this.addVisibleNumbers();
    this.addTileListeners();

    if(useAutoSolverRef.checked){
      const autoSolver = new AutoSolver(this.solution, this.playerBoard); 
      autoSolver.solve();      
    }
  }

  createBoard() {
    // Set the board with and height based on dimensions provided
    boardContainerElementRef.style.width = `${this.boardDimension * this.tileSize}px`;
    boardContainerElementRef.style.height = `${this.boardDimension * this.tileSize}px`;

    this.solution = boardStates[0];
    this.playerBoard = new Array(this.solution.length).fill(-1);

    let boardChildElements = "";
    for (let row = 0; row < this.boardDimension; row++) {
      for (let col = 0; col < this.boardDimension; col++) {
        boardChildElements += `<div id="${row}-${col}" arr-index="${col + (row * this.boardDimension)}" style="height: ${this.tileSize}px; width: ${this.tileSize}px; font-size: ${this.tileSize}px; border-top: ${row % 3 === 0 ? '2px solid red' : '1px solid black'}; border-bottom: ${row % 3 === 2 ? '2px solid red' : '1px solid black'}; border-left: ${col % 3 === 0 ? '2px solid red' : '1px solid black'}; border-right: ${col % 3 === 2 ? '2px solid red' : '1px solid black'}; box-sizing: border-box; cursor: pointer; user-select: none; display: flex; justify-content: center; align-items: center;"></div>`;
      }
    }

    boardContainerElementRef.innerHTML = boardChildElements;
  }

  addVisibleNumbers() {
    const ids = [...Array(sudokuTileElementRefs.length).keys()];

    for (let i = 0; i < sudokuTileElementRefs.length; i++) {
      sudokuTileElementRefs[i]["locked"] = false;      
    }

    for (let i = 0; i < this.clueAmount; i++) {
      const id = ids.splice(this.getRandomInt(ids.length), 1)[0];
      const sudokuTile = sudokuTileElementRefs[id];
      sudokuTile["locked"] = true;
      sudokuTile.innerHTML = this.solution[id];
      this.playerBoard[id] = this.solution[id];
    }
  }

  addTileListeners() {
    for (let i = 0; i < sudokuTileElementRefs.length; i++) {
      const sudokuTile = sudokuTileElementRefs[i];

      // Stop right click from opening the context menu
      sudokuTile.addEventListener("contextmenu", (contextMenuEvent) => {
        contextMenuEvent.preventDefault();
        contextMenuEvent.stopPropagation();
      });

      sudokuTile.addEventListener("mousedown", (mousedownEvent) => {
        if (sudokuTile["locked"] || this.won) {
          return;
        }
        if (mousedownEvent.button === 0) {
          sudokuTile.innerHTML = this.selectedNumber;
          sudokuTile.style.color = "green";
          this.playerBoard[sudokuTile.getAttribute("arr-index")] = this.selectedNumber;
        }

        this.won = this.playerBoard.every((v, i) => v === this.solution[i]);
        this.handleWin();
      });
    }

    this.boundEventHandler = this.handleNumberChange.bind(this);
    addEventListener("keyup", this.boundEventHandler);
  }

  handleNumberChange(keyboardEvent) {
    if (!["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(keyboardEvent.key)) {
      return;
    }

    this.selectedNumber = Number(keyboardEvent.key);
    numberSelectedRef.innerHTML = `Selected number: ${this.selectedNumber}`;
  }

  handleWin() {
    if (!this.won) {
      return;
    }

    confettiElementRef.innerHTML = new Array(25).fill(`<div class="confetti-piece"></div>`).join("");
  }



  checkThatBoardStateIsValid(board) {
    let validRows = true;
    let validColumns = true;
    let validChunks = true;
    let correctLength = true;
    let validNumbers = true;
    let correctNumberUsage = true;

    correctLength = board.length === this.boardDimension * this.boardDimension;

    validNumbers = board.every(v => v <= this.boardDimension && v >= 1);

    correctNumberUsage = Object.values(board.reduce((countMap, value) => {
      countMap[value] = (countMap[value] || 0) + 1;
      return countMap;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 })).every(v => v === 9);


    for (let i = 0; i < board.length; i += this.boardDimension) {
      const chunk = new Set(board.slice(i, i + this.boardDimension)).size === this.boardDimension;
      if (!chunk) {
        validRows = false;
        break;
      }
    }

    for (let row = 0; row < this.boardDimension; row++) {
      let chunk = new Set();

      for (let col = 0; col < this.boardDimension; col++) {
        chunk.add(board[row + (col * this.boardDimension)])
      }

      if (chunk.size !== this.boardDimension) {
        validColumns = false;
        break;
      }
    }

    for (let row = 0; row < this.boardDimension; row += 3) {
      for (let col = 0; col < this.boardDimension; col += 3) {
        let chunk = new Set();

        for (let dRow = 0; dRow < 3; dRow++) {
          for (let dCol = 0; dCol < 3; dCol++) {
            chunk.add(board[(row + dRow) * this.boardDimension + (col + dCol)]);
          }
        }

        if (chunk.size !== this.boardDimension) {
          validChunks = false;
          break;
        }
      }
    }

    return correctLength && validNumbers && correctNumberUsage && validRows && validColumns && validChunks;
  }


  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  onDestroy(){
    removeEventListener("keyup", this.boundEventHandler);
  }
}




let game;

resetBtnElementRef.addEventListener("click", () => {
  game?.onDestroy();
  game = new Sudoku();
});

document.addEventListener('DOMContentLoaded', (event) => {
  // Your initialization code here, such as creating a new game instance
  game = new Sudoku();
});


















