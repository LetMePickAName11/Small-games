const osc = require("osc");


const vrChatUdpRecieverPort = 9001;
const vrChatUdpSenderPort = 9000;
const url = 'localhost';
const inputEventTypes = ['Up', 'Down', 'Left', 'Right'];

let gameBoard;
let isGameActive = false;
let lastMessageDate = Date.now() - 1000;

const cellIndexMap = {
  0: 0,
  2: 1,
  4: 2,
  8: 3,
  16: 4,
  32: 5,
  64: 6,
  128: 7,
  256: 8,
  512: 9,
  1024: 10,
  2048: 11,
  4096: 12,
  8192: 13,
};


const oscReciever = new osc.UDPPort({
  localAddress: url,
  localPort: vrChatUdpRecieverPort,
  remotePort: vrChatUdpSenderPort,
  metadata: false
});

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

const onToggleGame = () => {
  isGameActive = !isGameActive;

  if (!isGameActive) {
    return;
  }

  gameBoard = {
    '0-0': 0,
    '0-1': 0,
    '0-2': 0,
    '0-3': 0,
    '1-0': 0,
    '1-1': 0,
    '1-2': 0,
    '1-3': 0,
    '2-0': 0,
    '2-1': 0,
    '2-2': 0,
    '2-3': 0,
    '3-0': 0,
    '3-1': 0,
    '3-2': 0,
    '3-3': 0,
  };

  addPieceToBoard();
};

const addPieceToBoard = () => {
  const availableSpaces = Object.entries(gameBoard).filter(([k, v]) => {
    return v === 0;
  });

  // Game over
  if (availableSpaces.length === 0) {
    return gameOver();
  }

  const randomIndex = getRandomInt(availableSpaces.length);
  const space = availableSpaces[randomIndex];

  gameBoard[space[0]] = Math.random() > 0.5 ? 2 : 4;

  updateVrc();
};

const gameOver = () => {
  isGameActive = false;
};

const canMoveUp = () => {
  for (let x = 0; x < 4; x++) {
    for (let y = 1; y < 4; y++) {
      if (gameBoard[`${x}-${y}`] !== 0) {
        if (gameBoard[`${x}-${y - 1}`] === 0 || gameBoard[`${x}-${y - 1}`] === gameBoard[`${x}-${y}`]) {
          return true;
        }
      }
    }
  }
  return false;
};

const canMoveDown = () => {
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 3; y++) {
      if (gameBoard[`${x}-${y}`] !== 0) {
        if (gameBoard[`${x}-${y + 1}`] === 0 || gameBoard[`${x}-${y + 1}`] === gameBoard[`${x}-${y}`]) {
          return true;
        }
      }
    }
  }
  return false;
};

const canMoveLeft = () => {
  for (let x = 1; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (gameBoard[`${x}-${y}`] !== 0) {
        if (gameBoard[`${x - 1}-${y}`] === 0 || gameBoard[`${x - 1}-${y}`] === gameBoard[`${x}-${y}`]) {
          return true;
        }
      }
    }
  }
  return false;
};

const canMoveRight = () => {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 4; y++) {
      if (gameBoard[`${x}-${y}`] !== 0) {
        if (gameBoard[`${x + 1}-${y}`] === 0 || gameBoard[`${x + 1}-${y}`] === gameBoard[`${x}-${y}`]) {
          return true;
        }
      }
    }
  }
  return false;
};

const movePiecesOnBoard = (direction) => {
  if (direction === 'Up' && canMoveUp()) {
    for (let x = 0; x < 4; x++) {
      for (let y = 1; y < 4; y++) {
        if (gameBoard[`${x}-${y}`] !== 0) {
          let newY = y;
          while (newY > 0 && gameBoard[`${x}-${newY - 1}`] === 0) {
            newY--;
          }
          if (newY > 0 && gameBoard[`${x}-${newY - 1}`] === gameBoard[`${x}-${y}`]) {
            gameBoard[`${x}-${newY - 1}`] *= 2;
            gameBoard[`${x}-${y}`] = 0;
          } else if (newY !== y) {
            gameBoard[`${x}-${newY}`] = gameBoard[`${x}-${y}`];
            gameBoard[`${x}-${y}`] = 0;
          }
        }
      }
    }

    return true;
  }
  else if (direction === 'Down' && canMoveDown()) {
    for (let x = 0; x < 4; x++) {
      for (let y = 2; y >= 0; y--) {
        if (gameBoard[`${x}-${y}`] !== 0) {
          let newY = y;
          while (newY < 3 && gameBoard[`${x}-${newY + 1}`] === 0) {
            newY++;
          }
          if (newY < 3 && gameBoard[`${x}-${newY + 1}`] === gameBoard[`${x}-${y}`]) {
            gameBoard[`${x}-${newY + 1}`] *= 2;
            gameBoard[`${x}-${y}`] = 0;
          } else if (newY !== y) {
            gameBoard[`${x}-${newY}`] = gameBoard[`${x}-${y}`];
            gameBoard[`${x}-${y}`] = 0;
          }
        }
      }
    }

    return true;
  }
  else if (direction === 'Left' && canMoveLeft()) {
    for (let y = 0; y < 4; y++) {
      for (let x = 1; x < 4; x++) {
        if (gameBoard[`${x}-${y}`] !== 0) {
          let newX = x;
          while (newX > 0 && gameBoard[`${newX - 1}-${y}`] === 0) {
            newX--;
          }
          if (newX > 0 && gameBoard[`${newX - 1}-${y}`] === gameBoard[`${x}-${y}`]) {
            gameBoard[`${newX - 1}-${y}`] *= 2;
            gameBoard[`${x}-${y}`] = 0;
          } else if (newX !== x) {
            gameBoard[`${newX}-${y}`] = gameBoard[`${x}-${y}`];
            gameBoard[`${x}-${y}`] = 0;
          }
        }
      }
    }

    return true;
  }
  else if (direction === 'Right' && canMoveRight()) {
    for (let y = 0; y < 4; y++) {
      for (let x = 2; x >= 0; x--) {
        if (gameBoard[`${x}-${y}`] !== 0) {
          let newX = x;
          while (newX < 3 && gameBoard[`${newX + 1}-${y}`] === 0) {
            newX++;
          }
          if (newX < 3 && gameBoard[`${newX + 1}-${y}`] === gameBoard[`${x}-${y}`]) {
            gameBoard[`${newX + 1}-${y}`] *= 2;
            gameBoard[`${x}-${y}`] = 0;
          } else if (newX !== x) {
            gameBoard[`${newX}-${y}`] = gameBoard[`${x}-${y}`];
            gameBoard[`${x}-${y}`] = 0;
          }
        }
      }
    }

    return true;
  }

  return false;
};

oscReciever.on("message", (oscMsg, _timeTag, _info) => {
  if (!oscMsg.address.includes('!') || Date.now()- lastMessageDate < 250) {
    return;
  }

  const eventType = oscMsg.address.split('!')[1];
  lastMessageDate = Date.now();

  if (eventType === 'ToggleGame') {
    console.log("oi")
    return onToggleGame();
  }

  if (!isGameActive) {
    return;
  }

  if (inputEventTypes.includes(eventType)) {
    if(oscMsg.args[0] === false){
      return;
    }
    if (movePiecesOnBoard(eventType)) {
      addPieceToBoard();
    }

    return;
  }

  console.error(`Invalid message type: ${oscMsg.address}`);
});

const updateVrc = () => {
  /*
  console.log("Update:------------------------------")
  console.log(`${gameBoard['0-0']} - ${gameBoard['1-0']} - ${gameBoard['2-0']} - ${gameBoard['3-0']}`);
  console.log(`${gameBoard['0-1']} - ${gameBoard['1-1']} - ${gameBoard['2-1']} - ${gameBoard['3-1']}`);
  console.log(`${gameBoard['0-2']} - ${gameBoard['1-2']} - ${gameBoard['2-2']} - ${gameBoard['3-2']}`);
  console.log(`${gameBoard['0-3']} - ${gameBoard['1-3']} - ${gameBoard['2-3']} - ${gameBoard['3-3']}`);
  console.log(" ");
  console.log(`${cellIndexMap[gameBoard['0-0']]} - ${cellIndexMap[gameBoard['1-0']]} - ${cellIndexMap[gameBoard['2-0']]} - ${cellIndexMap[gameBoard['3-0']]}`);
  console.log(`${cellIndexMap[gameBoard['0-1']]} - ${cellIndexMap[gameBoard['1-1']]} - ${cellIndexMap[gameBoard['2-1']]} - ${cellIndexMap[gameBoard['3-1']]}`);
  console.log(`${cellIndexMap[gameBoard['0-2']]} - ${cellIndexMap[gameBoard['1-2']]} - ${cellIndexMap[gameBoard['2-2']]} - ${cellIndexMap[gameBoard['3-2']]}`);
  console.log(`${cellIndexMap[gameBoard['0-3']]} - ${cellIndexMap[gameBoard['1-3']]} - ${cellIndexMap[gameBoard['2-3']]} - ${cellIndexMap[gameBoard['3-3']]}`);
  */

  for (const [key, value] of Object.entries(gameBoard)) {
    oscReciever.send({
      address: `/avatar/parameters/${key}`,
      args: [
        {
          type: "i",
          value: cellIndexMap[value]
        }
      ]
    }, "127.0.0.1", 9000);
  }
};

oscReciever.open();

// For debugging
/*
oscReciever.send({
  address: '/avatar/parameters/!ToggleGame',
  args: [
    {
      type: "i",
      value: 1,
    }
  ]
}, url, vrChatUdpRecieverPort);
*/