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
    -8, 1, 2, 7, 5, 3, 6, 4, 9,
    9, 4, -3, -6, 8, 2, 1, 7, 5,
    6, -7, 5, 4, -9, 1, -2, 8, 3,
    1, -5, 4, 2, 3, -7, 8, 9, 6,
    3, 6, 9, 8, -4, -5, -7, 2, 1,
    2, 8, 7, -1, 6, 9, 5, -3, 4,
    5, 2, -1, 9, 7, 4, 3, -6, -8,
    4, 3, -8, -5, 2, 6, 9, -1, 7,
    7, -9, 6, 3, 1, 8, -4, 5, 2
  ],
  [
    2, 3, 7, -8, 4, -1, 5, 6, 9,
    1, 8, 6, 7, 9, 5, 2, -4, -3,
    -5, 9, 4, 3, 2, 6, 7, 1, 8,
    3, 1, 5, 6, -7, 4, -8, 9, 2,
    4, 6, 9, 5, 8, 2, -1, 3, 7,
    7, -2, 8, 1, -3, 9, 4, 5, 6,
    -6, 4, 2, 9, 1, 8, 3, -7, -5,
    8, 5, -3, -4, 6, 7, 9, 2, 1,
    9, 7, 1, -2, 5, 3, -6, 8, 4
  ],
  [
    8, 6, 5, 4, 7, -2, 9, 1, -3,
    2, -4, 3, 9, 5, -1, -6, 8, -7,
    7, 9, -1, 6, 3, 8, 2, 5, -4,
    5, -8, 6, -1, 2, 3, 4, 7, 9,
    -4, -3, 7, 5, 8, 9, 1, -6, -2,
    9, 1, 2, -7, 4, 6, 5, 3, 8,
    3, 7, 4, 2, 6, 5, 8, 9, 1,
    -6, 2, -9, -8, 1, -7, -3, 4, 5,
    1, 5, 8, -3, 9, -4, -7, 2, 6
  ],
  [
    8, 7, 9, -1, 4, 5, 2, -6, 3, 
    3, -5, 6, 9, -8, 2, 1, 7, 4, 
    2, 4, 1, 6, -7, -3, 5, 9, 8, 
    9, 1, -3, 8, -5, 4, 7, 2, 6, 
    6, 2, 5, 3, 1, -7, 4, -8, -9, 
    4, -8, 7, -2, -6, -9, 3, -5, -1, 
    -7, 9, 8, -5, -3, 1, -6, 4, -2, 
    1, -6, 4, -7, -2, -8, 9, 3, -5, 
    5, 3, 2, 4, 9, 6, 8, 1, 7
  ]
  // Insert next solution here
];

//...1...6..5..8........73.....3.5.........7.89.8.269.517..53.6.2.6.728..5.........

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
  ];
  hiddenTripleCombinations = [];

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

    const potentialPairs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < potentialPairs.length - 2; i++) {
      for (let j = i + 1; j < potentialPairs.length - 1; j++) {
        for (let k = j + 1; k < potentialPairs.length; k++) {
          this.hiddenTripleCombinations.push([potentialPairs[i], potentialPairs[j], potentialPairs[k]])
        }
      }
    }
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

  updatePlayerSolution(index, value) {
    this.cellData[index].value = value;
    this.cellData[index].possibleValues = null;
  }

  solve() {
    // Debugging to check for too harsh potential value removal
    for (let index = 0; index < this.cellData.length; index++) {
      const element = this.cellData[index];

      if (element.possibleValues?.length === 0) {
        console.error(JSON.parse(JSON.stringify(element)));
      }
    }

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


    // Naked triple pair rows
    for (let rowId = 0; rowId < 9; rowId++) {
      // Current row cells
      const rowCells = this.getRow(rowId);
      // Filter out any cell that has a value or does not have exactly 2 or 3 possible values.
      const potentialPairs = rowCells.filter(rowCell => rowCell.value === -1 && (rowCell.possibleValues.length === 2 || rowCell.possibleValues.length === 3));
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }

      const combinations = []

      for (let i = 0; i < potentialPairs.length - 2; i++) {
        for (let j = i + 1; j < potentialPairs.length - 1; j++) {
          for (let k = j + 1; k < potentialPairs.length; k++) {
            combinations.push([potentialPairs[i], potentialPairs[j], potentialPairs[k]])
          }
        }
      }

      for (let i = 0; i < combinations.length; i++) {
        const cellCombination = combinations[i];
        const possibleNumbers = new Set(cellCombination.flatMap(cc => cc.possibleValues));
        if (possibleNumbers.size > 3) {
          continue;
        }

        for (const rowCell of rowCells.filter(rc => !cellCombination.includes(rc) && rc.value === -1)) {
          rowCell.possibleValues = rowCell.possibleValues.filter(pv => !possibleNumbers.has(pv));
        }
      }
    }

    // Naked triple pair columns
    for (let colId = 0; colId < 9; colId++) {
      // Current column cells
      const columnCells = this.getColumn(colId);
      // Filter out any cell that has a value or does not have exactly 2 or 3 possible values.
      const potentialPairs = columnCells.filter(columnCell => columnCell.value === -1 && (columnCell.possibleValues.length === 2 || columnCell.possibleValues.length === 3));
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }

      const combinations = []

      for (let i = 0; i < potentialPairs.length - 2; i++) {
        for (let j = i + 1; j < potentialPairs.length - 1; j++) {
          for (let k = j + 1; k < potentialPairs.length; k++) {
            combinations.push([potentialPairs[i], potentialPairs[j], potentialPairs[k]])
          }
        }
      }

      for (let i = 0; i < combinations.length; i++) {
        const cellCombination = combinations[i];
        const possibleNumbers = new Set(cellCombination.flatMap(cc => cc.possibleValues));
        if (possibleNumbers.size > 3) {
          continue;
        }

        for (const columnCell of columnCells.filter(cc => !cellCombination.includes(cc) && cc.value === -1)) {
          columnCell.possibleValues = columnCell.possibleValues.filter(pv => !possibleNumbers.has(pv));
        }
      }
    }

    // Naked triple pair chunks
    for (let chunkId = 0; chunkId < 9; chunkId++) {
      // Current chunk cells
      const chunkCells = this.getChunk(chunkId);
      // Filter out any cell that has a value or does not have exactly 2 or 3 possible values.
      const potentialPairs = chunkCells.filter(chunkCell => chunkCell.value === -1 && (chunkCell.possibleValues.length === 2 || chunkCell.possibleValues.length === 3));
      // If there are no potential pairs continue to next chunk
      if (potentialPairs.length === 0) {
        continue;
      }

      const combinations = []

      for (let i = 0; i < potentialPairs.length - 2; i++) {
        for (let j = i + 1; j < potentialPairs.length - 1; j++) {
          for (let k = j + 1; k < potentialPairs.length; k++) {
            combinations.push([potentialPairs[i], potentialPairs[j], potentialPairs[k]])
          }
        }
      }

      for (let i = 0; i < combinations.length; i++) {
        const cellCombination = combinations[i];
        const possibleNumbers = new Set(cellCombination.flatMap(cc => cc.possibleValues));
        if (possibleNumbers.size > 3) {
          continue;
        }

        for (const chunkCell of chunkCells.filter(cc => !cellCombination.includes(cc) && cc.value === -1)) {
          chunkCell.possibleValues = chunkCell.possibleValues.filter(pv => !possibleNumbers.has(pv));
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
        let pairCell = potentialPairs.filter(pp => pp.id !== cell.id).find(pp => cell.possibleValues.every(pv => pp.possibleValues.includes(pv)));
        // If there is no match continue to next cell
        if (pairCell === undefined) {
          continue;
        }

        // Remove naked pair possible values from the rest of the row and also exclude the pair cell and cell
        for (const rowCell of rowCells.filter(rc => rc.id !== pairCell.id && rc.id !== cell.id && rc.value === -1)) {
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
        // Remove naked pair possible values from the rest of the column and also exclude the pair cell and cell
        for (const columnCell of columnCells.filter(cc => cc.id !== pairCell.id && cc.id !== cell.id && cc.value === -1)) {
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
        // Remove naked pair possible values from the rest of the chunk and also exclude the pair cell and cell
        for (const chunkCell of chunkCells.filter(cc => cc.id !== pairCell.id && cc.id !== cell.id && cc.value === -1)) {
          chunkCell.possibleValues = chunkCell.possibleValues.filter(pv => !cell.possibleValues.includes(pv));
        }
      }
    }

    // Hidden single row
    for (let rowId = 0; rowId < 9; rowId++) {
      // Get current row cells
      const rowCells = this.getRow(rowId);
      // Iterate through the row
      for (let i = 0; i < rowCells.length; i++) {
        const cell = rowCells[i];
        // If the cell already has a value continue to next cell
        if (cell.value !== -1) {
          continue;
        }
        // Iterate through all posible values for the cell
        for (let j = 0; j < cell.possibleValues.length; j++) {
          const possibleValue = cell.possibleValues[j];
          // Calculate how many times the possible value is used in the row
          const occurrenceAmount = rowCells.reduce((accu, currentCell) => accu + (currentCell.possibleValues?.includes(possibleValue) ? 1 : 0), 0);
          // If the possible value is used more than exactly one continue to next number
          if (occurrenceAmount !== 1) {
            continue;
          }
          // Set the possible value to the number
          cell.possibleValues = [possibleValue];
          // Update possible value for the other cells in the row that do not have a value yet
          for (const rowCell of rowCells.filter(rc => rc.id !== cell.id && rc.value === -1)) {
            rowCell.possibleValues = rowCell.possibleValues.filter(pv => pv !== possibleValue);
          }
          // Break out of checking the current cells possible values as we have found a match
          break;
        }
      }
    }


    // Hidden single column
    for (let colId = 0; colId < 9; colId++) {
      const columnCells = this.getColumn(colId);

      for (let i = 0; i < columnCells.length; i++) {
        const cell = columnCells[i];

        if (cell.value !== -1) {
          continue;
        }

        for (let j = 0; j < cell.possibleValues.length; j++) {
          const possibleValue = cell.possibleValues[j];
          const occurrenceAmount = columnCells.reduce((accu, currentCell) => accu + (currentCell.possibleValues?.includes(possibleValue) ? 1 : 0), 0);

          if (occurrenceAmount !== 1) {
            continue;
          }

          cell.possibleValues = [possibleValue];

          for (const columnCell of columnCells.filter(cc => cc.id !== cell.id && cc.value === -1)) {
            columnCell.possibleValues = columnCell.possibleValues.filter(pv => pv !== possibleValue);
          }

          break;
        }
      }
    }

    // Hidden single chunk
    for (let chunkId = 0; chunkId < 9; chunkId++) {
      const chunkCells = this.getChunk(chunkId);

      for (let i = 0; i < chunkCells.length; i++) {
        const cell = chunkCells[i];

        if (cell.value !== -1) {
          continue;
        }

        for (let j = 0; j < cell.possibleValues.length; j++) {
          const possibleValue = cell.possibleValues[j];
          const occurrenceAmount = chunkCells.reduce((accu, currentCell) => accu + (currentCell.possibleValues?.includes(possibleValue) ? 1 : 0), 0);

          if (occurrenceAmount !== 1) {
            continue;
          }

          cell.possibleValues = [possibleValue];

          for (const chunkCell of chunkCells.filter(cc => cc.id !== cell.id && cc.value === -1)) {
            chunkCell.possibleValues = chunkCell.possibleValues.filter(pv => pv !== possibleValue);
          }

          break;
        }
      }
    }


    // Hidden pair rows
    for (let rowId = 0; rowId < this.cellData.length; rowId++) {
      // Get current row cells
      const rowCells = this.getRow(rowId);
      // Get all possible values used in current row and how often they are used
      const valueToCellsMap = {};
      for (let i = 0; i < rowCells.length; i++) {
        const cell = rowCells[i];

        for (let j = 0; j < cell.possibleValues?.length; j++) {
          const pv = cell.possibleValues[j];
          if (!valueToCellsMap[pv]) {
            valueToCellsMap[pv] = [];
          }

          valueToCellsMap[pv].push(cell);
        }
      }

      for (const cells of Object.values(valueToCellsMap)) {
        if (cells.length !== 2) {
          continue;
        }

        const uniquePotentialValues = new Set([...cells[0].possibleValues, ...cells[1].possibleValues]);
        if (uniquePotentialValues.size === 2) {
          cells[0].possibleValues = [...uniquePotentialValues];
          cells[1].possibleValues = [...uniquePotentialValues];
        }
      }
    }

    // Hidden pair columns
    for (let colId = 0; colId < this.cellData.length; colId++) {
      // Get current row cells
      const columnCells = this.getColumn(colId);
      // Get all possible values used in current column and how often they are used
      const valueToCellsMap = {};
      for (let i = 0; i < columnCells.length; i++) {
        const cell = columnCells[i];

        for (let j = 0; j < cell.possibleValues?.length; j++) {
          const pv = cell.possibleValues[j];
          if (!valueToCellsMap[pv]) {
            valueToCellsMap[pv] = [];
          }

          valueToCellsMap[pv].push(cell);
        }
      }

      for (const cells of Object.values(valueToCellsMap)) {
        if (cells.length !== 2) {
          continue;
        }

        const uniquePotentialValues = new Set([...cells[0].possibleValues, ...cells[1].possibleValues]);
        if (uniquePotentialValues.size === 2) {
          cells[0].possibleValues = [...uniquePotentialValues];
          cells[1].possibleValues = [...uniquePotentialValues];
        }
      }
    }

    // Hidden pair chunks
    for (let chunkId = 0; chunkId < this.cellData.length; chunkId++) {
      // Get current chunk cells
      const chunkCells = this.getChunk(chunkId);
      // Get all possible values used in current chunk and how often they are used
      const valueToCellsMap = {};
      for (let i = 0; i < chunkCells.length; i++) {
        const cell = chunkCells[i];

        for (let j = 0; j < cell.possibleValues?.length; j++) {
          const pv = cell.possibleValues[j];
          if (!valueToCellsMap[pv]) {
            valueToCellsMap[pv] = [];
          }

          valueToCellsMap[pv].push(cell);
        }
      }

      for (const cells of Object.values(valueToCellsMap)) {
        if (cells.length !== 2) {
          continue;
        }

        const uniquePotentialValues = new Set([...cells[0].possibleValues, ...cells[1].possibleValues]);
        if (uniquePotentialValues.size === 2) {
          cells[0].possibleValues = [...uniquePotentialValues];
          cells[1].possibleValues = [...uniquePotentialValues];
        }
      }
    }


    // Hidden triplets row
    for (let rowId = 0; rowId < this.cellData.length; rowId++) {
      // Get current row cells
      const rowCells = this.getRow(rowId).filter(rc => rc.value === -1);

      for (let i = 0; i < this.hiddenTripleCombinations.length; i++) {
        const combination = this.hiddenTripleCombinations[i];
        const potentialTripleCells = rowCells.filter(rc => combination.every(pc => rc.possibleValues.includes(pc)));

        if (potentialTripleCells.length !== 3) {
          continue;
        }

        const remaningCellsPossibleValues = rowCells.filter(rc => !potentialTripleCells.includes(rc)).map(rc => rc.possibleValues);
        let notUnique = false;

        for (let j = 0; j < combination.length; j++) {
          if (remaningCellsPossibleValues.some(rc => rc.includes(combination[j]))) {
            notUnique = true;
            break;
          }
        }

        if (notUnique) {
          continue;
        }

        for (let j = 0; j < potentialTripleCells.length; j++) {
          const rowCell = potentialTripleCells[j];
          rowCell.possibleValues = rowCell.possibleValues.filter(rc => combination.includes(rc));
        }
      }
    }

    // Hidden triplets colomn
    for (let columnId = 0; columnId < this.cellData.length; columnId++) {
      // Get current column cells
      const columnCells = this.getColumn(columnId).filter(rc => rc.value === -1);

      for (let i = 0; i < this.hiddenTripleCombinations.length; i++) {
        const combination = this.hiddenTripleCombinations[i];
        const potentialTripleCells = columnCells.filter(cc => combination.every(pc => cc.possibleValues.includes(pc)));

        if (potentialTripleCells.length !== 3) {
          continue;
        }

        const remaningCellsPossibleValues = columnCells.filter(cc => !potentialTripleCells.includes(cc)).map(cc => cc.possibleValues);
        let notUnique = false;

        for (let j = 0; j < combination.length; j++) {
          if (remaningCellsPossibleValues.some(cc => cc.includes(combination[j]))) {
            notUnique = true;
            break;
          }
        }

        if (notUnique) {
          continue;
        }

        for (let j = 0; j < potentialTripleCells.length; j++) {
          const columnCell = potentialTripleCells[j];
          columnCell.possibleValues = columnCell.possibleValues.filter(cc => combination.includes(cc));
        }
      }
    }

    // Hidden triplets chunk
    for (let chunkId = 0; chunkId < this.cellData.length; chunkId++) {
      // Get current column cells
      const chunkCells = this.getChunk(chunkId).filter(rc => rc.value === -1);

      for (let i = 0; i < this.hiddenTripleCombinations.length; i++) {
        const combination = this.hiddenTripleCombinations[i];
        const potentialTripleCells = chunkCells.filter(cc => combination.every(pc => cc.possibleValues.includes(pc)));

        if (potentialTripleCells.length !== 3) {
          continue;
        }

        const remaningCellsPossibleValues = chunkCells.filter(cc => !potentialTripleCells.includes(cc)).map(cc => cc.possibleValues);
        let notUnique = false;

        for (let j = 0; j < combination.length; j++) {
          if (remaningCellsPossibleValues.some(cc => cc.includes(combination[j]))) {
            notUnique = true;
            break;
          }
        }

        if (notUnique) {
          continue;
        }

        for (let j = 0; j < potentialTripleCells.length; j++) {
          const chunkCell = potentialTripleCells[j];
          chunkCell.possibleValues = chunkCell.possibleValues.filter(cc => combination.includes(cc));
        }
      }
    }


    // X-Wing rows
    for (let rowId = 0; rowId < 9; rowId++) {
      // Get current row
      const rowCells = this.getRow(rowId);
      // Iterate through all possible cell values
      for (let i = 1; i < 10; i++) {
        // Find the cells that do not have a value and with the number as a possible value
        const rowCellsWithNumber = rowCells.filter(rc => rc.value === -1 && rc.possibleValues.includes(i));
        // If there are more than 2 continue to next number
        if (rowCellsWithNumber.length !== 2) {
          continue;
        }

        // Get the two columns that the cells belong to, filter out cells already set and find the cells that has the number as a possible value
        // This should find the cells from previous again
        const firstColumn = this.getColumn(rowCellsWithNumber[0].colId).filter(cc => cc.value === -1);
        const firstColumnn = firstColumn.filter(cc => cc.possibleValues.includes(i));
        const secondColumn = this.getColumn(rowCellsWithNumber[1].colId).filter(cc => cc.value === -1);
        const secondColumnn = secondColumn.filter(cc => cc.possibleValues.includes(i));
        // Ensure that we have only found 2 rows
        const exactlyTwoRows = new Set(firstColumnn.map(fc => fc.rowId).concat(secondColumn.map(sc => sc.rowId))).size === 2;
        // If there are not exactly two cells in each column continue to next number
        if (firstColumnn.length !== 2 || secondColumnn.length !== 2 || !exactlyTwoRows) {
          continue;
        }

        // Remove the number from the possible values of all other cells in the columns
        for (const f of firstColumn.filter(fc => !firstColumnn.includes(fc))) {
          f.possibleValues = f.possibleValues.filter(pv => pv !== i);
        }
        for (const f of secondColumn.filter(fc => !secondColumnn.includes(fc))) {
          f.possibleValues = f.possibleValues.filter(pv => pv !== i);
        }
      }
    }

    // X-Wing columns
    for (let colId = 0; colId < 9; colId++) {
      // Get current column
      const columnCells = this.getColumn(colId);
      // Iterate through all possible cell values
      for (let i = 1; i < 10; i++) {
        // Find the cells that do not have a value and with the number as a possible value
        const columnCellsWithNumber = columnCells.filter(cc => cc.value === -1 && cc.possibleValues.includes(i));
        // If there are more than 2 continue to next number
        if (columnCellsWithNumber.length !== 2) {
          continue;
        }

        for (let secondColId = 0; secondColId < 9; secondColId++) {
          if (secondColId === colId) {
            continue;
          }

          const secondColumnCells = this.getColumn(secondColId).filter(cc => cc.value === -1);
          const secondColumnCellsWithNumber = secondColumnCells.filter(sccwn => sccwn.possibleValues.includes(i));
          const exactlyTwoColumns = new Set(columnCellsWithNumber.map(fc => fc.rowId).concat(secondColumnCellsWithNumber.map(sc => sc.rowId))).size === 2;

          if (secondColumnCellsWithNumber.length !== 2 || !exactlyTwoColumns) {
            continue;
          }

          // Remove the number from the possible values of all other cells in the columns
          for (const f of columnCells.filter(fc => fc.value === -1 && !columnCellsWithNumber.includes(fc))) {
            f.possibleValues = f.possibleValues.filter(pv => pv !== i);
          }
          for (const f of secondColumnCells.filter(fc => !secondColumnCellsWithNumber.includes(fc))) {
            f.possibleValues = f.possibleValues.filter(pv => pv !== i);
          }
        }
      }
    }


    // Swordfish rows
    for (let i = 1; i < 10; i++) {
      const potentialCellsInRows = [];
      // Iterate all rows
      for (let rowId = 0; rowId < 9; rowId++) {
        // Find all cells that do not have a value and has the current number in their possible values
        const rowCells = this.getRow(rowId).filter(rc => rc.value === -1 && rc.possibleValues.includes(i));
        // If there are not 2 or 3 cells then continue to next row
        if (rowCells.length !== 2 && rowCells.length !== 3) {
          continue;
        }

        potentialCellsInRows.push(rowCells);
      }
      // If there are more than 3 rows with the number continue to next number
      if (potentialCellsInRows.length !== 3) {
        continue;
      }
      // Flatten the rows to their cells
      const potentialCellsInRowsFlattend = potentialCellsInRows.flat();
      // Get all unique columns from the row cells
      const uniqueColumnIds = potentialCellsInRowsFlattend.reduce((accu, val) => {
        if (!accu.includes(val.colId)) {
          accu.push(val.colId);
        }

        return accu;
      }, []);
      // If there are not exactly 3 columns continue to next number
      if (uniqueColumnIds.length !== 3) {
        continue;
      }
      // Iterate through the swordfish columns
      for (let j = 0; j < uniqueColumnIds.length; j++) {
        // Filter out cells that already have a value and the cells that are part of the swordfish
        const columnCells = this.getColumn(uniqueColumnIds[j]).filter(cc => cc.value === -1 && !potentialCellsInRowsFlattend.includes(cc));
        // Iterate through the cells and remove the current number from their possible values
        for (let k = 0; k < columnCells.length; k++) {
          columnCells[k].possibleValues = columnCells[k].possibleValues.filter(pv => pv !== i);
        }
      }
    }

    // Swordfish columns
    for (let i = 1; i < 10; i++) {
      const potentialCellsInColumns = [];
      // Iterate all columns
      for (let colId = 0; colId < 9; colId++) {
        // Find all cells that do not have a value and has the current number in their possible values
        const columnCells = this.getColumn(colId).filter(cc => cc.value === -1 && cc.possibleValues.includes(i));
        // If there are not 2 or 3 cells then continue to next column
        if (columnCells.length !== 2 && columnCells.length !== 3) {
          continue;
        }

        potentialCellsInColumns.push(columnCells);
      }
      // If there are more than 3 column with the number continue to next number
      if (potentialCellsInColumns.length !== 3) {
        continue;
      }
      // Flatten the columns to their cells
      const potentialCellsInColumnsFlattend = potentialCellsInColumns.flat();
      // Get all unique rows from the columns cells
      const uniqueRowIds = potentialCellsInColumnsFlattend.reduce((accu, val) => {
        if (!accu.includes(val.rowId)) {
          accu.push(val.rowId);
        }

        return accu;
      }, []);
      // If there are not exactly 3 rows continue to next number
      if (uniqueRowIds.length !== 3) {
        continue;
      }
      // Iterate through the swordfish rows
      for (let j = 0; j < uniqueRowIds.length; j++) {
        // Filter out cells that already have a value and the cells that are part of the swordfish
        const columnCells = this.getRow(uniqueRowIds[j]).filter(cc => cc.value === -1 && !potentialCellsInColumnsFlattend.includes(cc));
        // Iterate through the cells and remove the current number from their possible values
        for (let k = 0; k < columnCells.length; k++) {
          columnCells[k].possibleValues = columnCells[k].possibleValues.filter(pv => pv !== i);
        }
      }
    }


    // Jellyfish rows
    for (let i = 1; i < 10; i++) {
      const potentialCellsInRows = [];
      // Iterate all rows
      for (let rowId = 0; rowId < 9; rowId++) {
        // Find all cells that do not have a value and has the current number in their possible values
        const rowCells = this.getRow(rowId).filter(rc => rc.value === -1 && rc.possibleValues.includes(i));
        // If there are not 2, 3 or 4 cells then continue to next row
        if (![2, 3, 4].includes(rowCells.length)) {
          continue;
        }

        potentialCellsInRows.push(rowCells);
      }
      // If there are more than 4 rows with the number continue to next number
      if (potentialCellsInRows.length !== 4) {
        continue;
      }
      // Flatten the rows to their cells
      const potentialCellsInRowsFlattend = potentialCellsInRows.flat();
      // Get all unique columns from the row cells
      const uniqueColumnIds = potentialCellsInRowsFlattend.reduce((accu, val) => {
        if (!accu.includes(val.colId)) {
          accu.push(val.colId);
        }

        return accu;
      }, []);
      // If there are not exactly 4 columns continue to next number
      if (uniqueColumnIds.length !== 4) {
        continue;
      }
      // Iterate through the swordfish columns
      for (let j = 0; j < uniqueColumnIds.length; j++) {
        // Filter out cells that already have a value and the cells that are part of the swordfish
        const columnCells = this.getColumn(uniqueColumnIds[j]).filter(cc => cc.value === -1 && !potentialCellsInRowsFlattend.includes(cc));
        // Iterate through the cells and remove the current number from their possible values
        for (let k = 0; k < columnCells.length; k++) {
          columnCells[k].possibleValues = columnCells[k].possibleValues.filter(pv => pv !== i);
        }
      }
    }

    // Jellyfish columns
    for (let i = 1; i < 10; i++) {
      const potentialCellsInColumns = [];
      // Iterate all columns
      for (let colId = 0; colId < 9; colId++) {
        // Find all cells that do not have a value and has the current number in their possible values
        const columnCells = this.getColumn(colId).filter(cc => cc.value === -1 && cc.possibleValues.includes(i));
        // If there are not 2, 3 or 4 cells then continue to next column
        if (![2, 3, 4].includes(columnCells.length)) {
          continue;
        }

        potentialCellsInColumns.push(columnCells);
      }
      // If there are more than 4 column with the number continue to next number
      if (potentialCellsInColumns.length !== 4) {
        continue;
      }
      // Flatten the columns to their cells
      const potentialCellsInColumnsFlattend = potentialCellsInColumns.flat();
      // Get all unique rows from the columns cells
      const uniqueRowIds = potentialCellsInColumnsFlattend.reduce((accu, val) => {
        if (!accu.includes(val.rowId)) {
          accu.push(val.rowId);
        }

        return accu;
      }, []);
      // If there are not exactly 4 rows continue to next number
      if (uniqueRowIds.length !== 4) {
        continue;
      }
      // Iterate through the swordfish rows
      for (let j = 0; j < uniqueRowIds.length; j++) {
        // Filter out cells that already have a value and the cells that are part of the swordfish
        const columnCells = this.getRow(uniqueRowIds[j]).filter(cc => cc.value === -1 && !potentialCellsInColumnsFlattend.includes(cc));
        // Iterate through the cells and remove the current number from their possible values
        for (let k = 0; k < columnCells.length; k++) {
          columnCells[k].possibleValues = columnCells[k].possibleValues.filter(pv => pv !== i);
        }
      }
    }


    if (this.cellData.some(cell => cell.possibleValues?.length === 1) || this.cellData.every(v => v.value !== -1)) {
      return this.solve();
    }

    console.time("Bruteforce");
    console.log(`Cells to bruteforce: ${this.cellData.filter(cell => cell.value === -1).length}`);
    let stepsTaken = {count: 0};
    this.bruteForce(this.cellData, stepsTaken);
    console.log(stepsTaken.count);
    console.timeEnd("Bruteforce");
    this.solve();
  }


  bruteForce(cells, stepsTaken) {
    const unfilledCells = cells.filter(cell => cell.value === -1).sort((a, b) => a.possibleValues.length - b.possibleValues.length);

    if (unfilledCells.length === 0) {
      return true;
    }

    stepsTaken.count++;

    //if(stepsTaken.count % 100000 === 0){
    //  console.log(stepsTaken.count);
    //}

    const cell = unfilledCells[0];
    const usedNumbers = new Set([
      ...this.getRow(cell.rowId).map(c => c.value),
      ...this.getColumn(cell.colId).map(c => c.value),
      ...this.getChunk(cell.chunkId).map(c => c.value)
    ]);

    for (const possibleValue of cell.possibleValues) {
      if (usedNumbers.has(possibleValue)) {
        continue;
      }

      cell.value = possibleValue;

      if (this.bruteForce(cells, stepsTaken)) {
        return true;
      }

      cell.value = -1;
    }

    return false;
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

    if (useAutoSolverRef.checked) {
      console.time("Auto solver start");
      const autoSolver = new AutoSolver(this.solution, this.playerBoard);
      autoSolver.solve();
      console.timeEnd("Auto solver start");
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
    for (let i = 0; i < sudokuTileElementRefs.length; i++) {
      sudokuTileElementRefs[i]["locked"] = false;
    }

    for (let index = 0; index < this.solution.length; index++) {
      const cellNumber = this.solution[index];
      this.solution[index] = Math.abs(cellNumber);

      if (cellNumber > 0) {
        continue;
      }
      const sudokuTile = sudokuTileElementRefs[index];
      sudokuTile["locked"] = true;
      sudokuTile.innerHTML = Math.abs(cellNumber);
      this.playerBoard[index] = Math.abs(cellNumber);
    }

    // https://www.thonky.com/sudoku/solution-count
    // console.log(this.playerBoard.map(v => v === -1 ? '.' : `${v}`).join(''))
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

  onDestroy() {
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