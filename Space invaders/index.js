// HTML references
const boardContainerElementRef = document.getElementById("boardContainer");
const scoreElementRef = document.getElementById("score");
const resetBtnElementRef = document.getElementById("resetBtn");
const confettiElementRef = document.getElementById("confetti");

const canvasCtx = boardContainerElementRef.getContext("2d");

class SpaceInvaders {
  score = 0;
  lost = false;

  // Game variables
  canvasSize = new Point(-1, -1);
  ratio = new Point(-1, -1);
  lostY = -1;

  // Update time tracker
  tickSpeed;
  lastTick;

  // Tetris information
  direction = Direction.ArrowRight;

  // 10 wide 20 tall
  player = new Player(null, null, null);
  invaders = [];
  shots = [];

  constructor() {
    // Setup game board settings
    this.canvasSize = new Point(320, 640);
    this.tickSpeed = 100;
    this.ratio = new Point(10, 20);
    this.lostY = this.canvasSize.y * 0.9

    scoreElementRef.innerText = "Score: 0";
    confettiElementRef.innerHTML = "";
    boardContainerElementRef.width = this.canvasSize.x;
    boardContainerElementRef.height = this.canvasSize.y;

    const playerPosition = new Point(this.canvasSize.x / 2, this.lostY);
    const playerSize = new Point(this.canvasSize.x / this.ratio.x, this.canvasSize.y / this.ratio.y)
    this.player = new Player("red", playerPosition, playerSize);

    this.spawnInvaders();
    this.addEventListeners();
    this.lastTick = Date.now();
    this.update();
  }

  spawnInvaders() {
    const xX = this.canvasSize.x / this.ratio.x;
    const yY = this.canvasSize.y / this.ratio.y;

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const position = new Point(xX * x + x * xX + xX * 0.5, yY * y + y * yY + yY);
        const size = new Point(xX, yY);
        this.invaders.push(new Invader("blue", position, size));
      }
    }
  }

  addEventListeners() {
    addEventListener("keydown", (event) => {
      if (event.key === " " && this.player.canShoot()) {
        const shotPosition = Point.add(this.player.position, (this.player.size.x / 2) - 5, -(this.player.size.y / 2));
        const shotSize = new Point(10, 10);
        this.shots.push(new Shot("purple", shotPosition, shotSize));
      }
      if (event.key === Direction.ArrowRight && this.player.testNewPosition(new Point(0,0), this.canvasSize, Point.add(this.player.position, 10, 0))) {
        this.player.position.x += 10;
      }
      if (event.key === Direction.ArrowLeft && this.player.testNewPosition(new Point(0,0), this.canvasSize, Point.add(this.player.position, -10, 0))) {
        this.player.position.x += -10;
      }
    });
  }

  update() {
    this.draw();

    // If lost break out of loop
    if (this.lost) {
      return console.log("lost");
    }

    if (Date.now() - this.lastTick < this.tickSpeed) {
      return requestAnimationFrame(this.update.bind(this));;
    }

    this.updateShots();
    if (this.checkWinCondinion()) {
      confettiElementRef.innerHTML = new Array(25).fill(`<div class="confetti-piece"></div>`).join("");
      return this.draw();
    }

    this.updateInvaders();

    if (this.checkLooseCondition()) {
      return this.draw();
    }

    this.lastTick = Date.now();
    requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    canvasCtx.clearRect(0, 0, boardContainerElementRef.width, boardContainerElementRef.height);

    for (let i = 0; i < this.invaders.length; i++) {
      this.drawHelper(this.invaders[i].position, this.invaders[i].size, this.invaders[i].color);
    }

    for (let i = 0; i < this.shots.length; i++) {
      this.drawHelper(this.shots[i].position, this.shots[i].size, this.shots[i].color);
    }

    this.drawHelper(this.player.position, this.player.size, this.player.color);
  }

  updateShots() {
    for (let i = 0; i < this.shots.length; i++) {
      const shot = this.shots[i];
      const invader = this.invaders.find(inv => shot.overlaps(inv));

      if(invader !== undefined && invader !== null){
        invader.dead = true;
        shot.dead = true;
        this.score += 1;
        scoreElementRef.innerText = `Score: ${this.score}`;
      }
    }

    this.shots = this.shots.filter(s => !s.dead);
    this.invaders = this.invaders.filter(i => !i.dead);

    for (let i = 0; i < this.shots.length; i++) {
      this.shots[i].position.y -= this.canvasSize.y / this.ratio.y;
    }

    this.shots = this.shots.filter(s => s.position.y > 0);
  }

  checkWinCondinion() {
    return this.invaders.length === 0;
  }

  updateInvaders() {
    const shouldTurn = this.invaders.some(i => !i.testNewPosition(new Point(0,0), this.canvasSize, Point.add(i.position, 1, 0)));

    if (shouldTurn) {
      this.direction = this.direction === Direction.ArrowRight ? Direction.ArrowLeft : Direction.ArrowRight;
    }

    for (let i = 0; i < this.invaders.length; i++) {
      const element = this.invaders[i];
      element.position.x += this.direction === Direction.ArrowRight ? 1 : -1;
      if (shouldTurn) {
        element.position.y += element.size.y;
      }
    }
  }

  checkLooseCondition() {
    return this.invaders.some(i => i.position.y + i.size.y >= this.lostY);
  }

  drawHelper(position, size, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(position.x, position.y, size.x, size.y);
    canvasCtx.fillStyle = "orange";
    canvasCtx.strokeRect(position.x, position.y, size.x, size.y);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}

class Player {
  color = "";
  position = new Point(-1, -1);
  size = new Point(-1, -1);
  lastTick = -1;
  tickSpeed = -1;

  constructor(color, position, size) {
    this.color = color;
    this.position = position;
    this.size = size;
    this.tickSpeed = 500;
    this.lastTick = Date.now();
  }

  canShoot() {
    if (Date.now() - this.lastTick < this.tickSpeed) {
      return false;
    }

    this.lastTick = Date.now();
    return true;
  }

  testNewPosition(boundsMin, boundsMax, newPosition) {
    const validXMin = (newPosition.x) > boundsMin.x;
    const validXMax = (newPosition.x + this.size.x) < boundsMax.x;
    const validYMin = (newPosition.y) > boundsMin.y;
    const validYMax = (newPosition.y + this.size.y) < boundsMax.y;

    return validXMin && validXMax && validYMin && validYMax;
  }
}

class Shot {
  color = "";
  position = new Point(-1, -1);
  size = new Point(-1, -1);
  dead = false;

  constructor(color, position, size) {
    this.color = color;
    this.position = position.clone();
    this.size = size;
  }

  overlaps(invader) {
    const shotLeft = this.position.x;
    const shotRight = this.position.x + this.size.x;
    const shotTop = this.position.y;
    const shotBottom = this.position.y + this.size.y;

    const invaderLeft = invader.position.x;
    const invaderRight = invader.position.x + invader.size.x;
    const invaderTop = invader.position.y;
    const invaderBottom = invader.position.y + invader.size.y;

    // Check for overlap
    return (shotRight > invaderLeft && shotLeft < invaderRight && shotBottom > invaderTop && shotTop < invaderBottom) 
  }
}

class Invader {
  color = "";
  position = new Point(-1, -1);
  size = new Point(-1, -1);
  dead = false;

  constructor(color, position, size) {
    this.color = color;
    this.position = position;
    this.size = size;
  }

  testNewPosition(boundsMin, boundsMax, newPosition) {
    const validXMin = (newPosition.x) > boundsMin.x;
    const validXMax = (newPosition.x + this.size.x) < boundsMax.x;
    const validYMin = (newPosition.y) > boundsMin.y;
    const validYMax = (newPosition.y + this.size.y) < boundsMax.y;

    return validXMin && validXMax && validYMin && validYMax;
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

  static add(point, x, y) {
    return new Point(point.x + x, point.y + y);
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
  game = new SpaceInvaders();
});

resetBtnElementRef.click();