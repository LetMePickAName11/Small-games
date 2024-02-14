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

    // Iterate through all cells and set value if there is only 1 possible value
    for (let i = 0; i < this.cellData.length; i++) {
      const cell = this.cellData[i];
      // Only check if value has not been set
      if (cell.value !== -1 || cell.possibleValues.length !== 1) {
        continue;
      }
      
      // Update the internal data
      this.updatePlayerSolution(cell.id, cell.possibleValues[0]);
      // Temp for debugging
      dispatchEvent(new KeyboardEvent('keyup', { key: `${cell.value}` }));
      sudokuTileElementRefs[cell.id].dispatchEvent(new MouseEvent('mousedown'));
    }

    // Simple row, column and chunk comparison
    for (let i = 0; i < this.cellData.length; i++) {
      const cell = this.cellData[i];
      // Only check if value has not been set
      if (cell.value !== -1) {
        continue;
      }
      // Get the corresponding row, column and chunk values
      const usedNumbers = [
        ...this.getRow(cell.rowId).map(c => c.value),
        ...this.getColumn(cell.colId).map(c => c.value),
        ...this.getChunk(cell.chunkId).map(c => c.value)
      ];
      // Inverse so we get the remaining possible values
      cell.possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !usedNumbers.includes(v));
      // If there is only 1 remaining possible value
      if (cell.possibleValues.length === 1) {        
        // Recursively start again
        return this.solve();
      }
    }


    // Nake triple pair rows
    for (let rowId = 0; rowId < 9; rowId++) {
      // Current row cells
      const rowCells = this.getRow(rowId);
      // Filter out any cell that has a value or does not have exactly 2 or 3 possible values.
      const potentialPairs = rowCells.filter(rowCell => rowCell.value === -1 && (rowCell.possibleValues.length === 2 || rowCell.possibleValues.length === 3));
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }
      // Iterate through the potential pairs
      for (let i = 0; i < potentialPairs.length; i++) {
        const cell = potentialPairs[i];
        const potentialPairsForNumber = [cell];

        for (let j = 0; j < cell.possibleValues.length; j++) {
          const ppw = potentialPairs.filter(pp => pp.id !== cell.id && pp.possibleValues.includes(cell.possibleValues[j]) && potentialPairsForNumber.every(ppfn => ppfn.id !== pp.id));
          potentialPairsForNumber.push(...ppw);
        }

        if (!(potentialPairsForNumber.length === 3 && new Set(...potentialPairsForNumber.map(pp => pp.possibleValues)).size === 3)) {
          continue;
        }

        // Remove naked pair possible values from the rest of the row and also exclude the pair cell (we have already excluded current cell earlier)
        for (const rowCell of rowCells.filter(rc => !potentialPairsForNumber.includes(rc.id) && rc.value === -1)) {
          rowCell.possibleValues = rowCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }

    // Nake triple pair columns
    for (let colId = 0; colId < 9; colId++) {
      // Current column cells
      const columnCells = this.getColumn(colId);
      // Filter out any cell that has a value or does not have exactly 2 or 3 possible values.
      const potentialPairs = columnCells.filter(colCell => colCell.value === -1 && (colCell.possibleValues.length === 2 || colCell.possibleValues.length === 3));
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }
      // Iterate through the potential pairs
      for (let i = 0; i < potentialPairs.length; i++) {
        const cell = potentialPairs[i];
        const potentialPairsForNumber = [cell];

        for (let j = 0; j < cell.possibleValues.length; j++) {
          const ppw = potentialPairs.filter(pp => pp.id !== cell.id && pp.possibleValues.includes(cell.possibleValues[j]) && potentialPairsForNumber.every(ppfn => ppfn.id !== pp.id));
          potentialPairsForNumber.push(...ppw);
        }

        if (!(potentialPairsForNumber.length === 3 && new Set(...potentialPairsForNumber.map(pp => pp.possibleValues)).size === 3)) {
          continue;
        }

        // Remove naked pair possible values from the rest of the column and also exclude the pair cell (we have already excluded current cell earlier)
        for (const columnCell of columnCells.filter(cc => !potentialPairsForNumber.includes(cc.id) && cc.value === -1)) {
          columnCell.possibleValues = columnCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }

    // Nake triple pair chunks
    for (let chunkId = 0; chunkId < 9; chunkId++) {
      // Current chunk cells
      const chunkCells = this.getChunk(chunkId);
      // Filter out any cell that has a value or does not have exactly 2 or 3 possible values.
      const potentialPairs = chunkCells.filter(chunkCell => chunkCell.value === -1 && (chunkCell.possibleValues.length === 2 || chunkCell.possibleValues.length === 3));
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }
      // Iterate through the potential pairs
      for (let i = 0; i < potentialPairs.length; i++) {
        const cell = potentialPairs[i];
        const potentialPairsForNumber = [cell];

        for (let j = 0; j < cell.possibleValues.length; j++) {
          const ppw = potentialPairs.filter(pp => pp.id !== cell.id && pp.possibleValues.includes(cell.possibleValues[j]) && potentialPairsForNumber.every(ppfn => ppfn.id !== pp.id));
          potentialPairsForNumber.push(...ppw);
        }

        if (!(potentialPairsForNumber.length === 3 && new Set(...potentialPairsForNumber.map(pp => pp.possibleValues)).size === 3)) {
          continue;
        }

        // Remove naked pair possible values from the rest of the chunk and also exclude the pair cell (we have already excluded current cell earlier)
        for (const chunkCell of chunkCells.filter(cc => !potentialPairsForNumber.includes(cc.id) && cc.value === -1)) {
          chunkCell.possibleValues = chunkCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }


    // Naked pairs rows
    for (let rowId = 0; rowId < 9; rowId++) {
      // Current row cells
      const rowCells = this.getRow(rowId);
      // Filter out any cell that has a value or does not have exactly 2 possible values.
      const potentialPairs = rowCells.filter(rowCell => rowCell.value === -1 && rowCell.possibleValues.length === 2);
      // If there are no potential pairs continue to next row
      if (potentialPairs.length === 0) {
        continue;
      }
      // Iterate through the potential pairs
      for (let i = 0; i < potentialPairs.length; i++) {
        const cell = potentialPairs[i];
        let pairCell = potentialPairs.filter(pp => pp.id !== cell.id).find(pp => cell.possibleValues.every(pv => pp.possibleValues.includes(pv)))
        // If there is no match continue to next cell
        if (pairCell === undefined) {
          continue;
        }
        // Remove naked pair possible values from the rest of the row and also exclude the pair cell (we have already excluded current cell earlier)
        for (const rowCell of rowCells.filter(rc => rc.id !== pairCell.id && rc.value === -1)) {
          rowCell.possibleValues = rowCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }

    // Naked pairs columns
    for (let columnId = 0; columnId < 9; columnId++) {
      // Current column cells
      const columnCells = this.getColumn(columnId);
      // Filter out any cell that has a value or does not have exactly 2 possible values.
      const potentialPairs = columnCells.filter(columnCell => columnCell.value === -1 && columnCell.possibleValues.length === 2);
      // If there are no potential pairs continue to next column
      if (potentialPairs.length === 0) {
        continue;
      }
      // Iterate through the potential pairs
      for (let i = 0; i < potentialPairs.length; i++) {
        const cell = potentialPairs[i];
        let pairCell = potentialPairs.filter(pp => pp.id !== cell.id).find(pp => cell.possibleValues.every(pv => pp.possibleValues.includes(pv)))
        // If there is no match continue to next cell
        if (pairCell === undefined) {
          continue;
        }
        // Remove naked pair possible values from the rest of the column and also exclude the pair cell (we have already excluded current cell earlier)
        for (const columnCell of columnCells.filter(cc => cc.id !== pairCell.id && cc.value === -1)) {
          columnCell.possibleValues = columnCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }

    // Naked pairs chunk
    for (let chunkId = 0; chunkId < 9; chunkId++) {
      // Current chunk cells
      const chunkCells = this.getChunk(chunkId);
      // Filter out any cell that has a value or does not have exactly 2 possible values.
      const potentialPairs = chunkCells.filter(chunkCell => chunkCell.value === -1 && chunkCell.possibleValues.length === 2);
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }
      // Iterate through the potential pairs
      for (let i = 0; i < potentialPairs.length; i++) {
        const cell = potentialPairs[i];
        let pairCell = potentialPairs.filter(pp => pp.id !== cell.id).find(pp => cell.possibleValues.every(pv => pp.possibleValues.includes(pv)))
        // If there is no match continue to next cell
        if (pairCell === undefined) {
          continue;
        }
        // Remove naked pair possible values from the rest of the chunk and also exclude the pair cell (we have already excluded current cell earlier)
        for (const chunkCell of chunkCells.filter(cc => cc.id !== pairCell.id && cc.value === -1)) {
          chunkCell.possibleValues = chunkCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }

    if (this.cellData.some(cell => cell.possibleValues?.length === 1) || this.cellData.every(v => v.value !== -1)) {
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


















