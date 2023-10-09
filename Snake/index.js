// HTML references
const boardContainerElementRef = document.getElementById("boardContainer");
const scoreElementRef = document.getElementById("score");
const resetBtnElementRef = document.getElementById("resetBtn");
const confettiElementRef = document.getElementById("confetti");

const canvasCtx = boardContainerElementRef.getContext("2d");



class Snake {
  score = 0;
  lost = false;
  won = false;

  // Game variables
  height;
  width;
  tickSpeed;
  ratio;
  applesToSpwan;

  tileWidth;
  tileHeight;
  // Update time tracker
  lastTick;

  // Snake information
  direction = Direction.ArrowRight;
  perviousDirection = Direction.ArrowRight;
  head = new Point(0, 0);
  body = [];
  apples = [];



  constructor() {
    // Setup game board settings
    this.height = 640;
    this.width = 640;
    this.tickSpeed = 175;
    this.ratio = 10;
    this.applesToSpwan = 1;
    this.headColor = "grey";
    this.bodyColor = "black";
    this.appleColor = "red";

    this.tileWidth = (this.width / this.ratio);
    this.tileHeight = (this.height / this.ratio);

    scoreElementRef.innerText = "Score: 0";
    confettiElementRef.innerHTML = "";
    boardContainerElementRef.width = this.width;
    boardContainerElementRef.height = this.height;

    this.addEventListeners();
    this.spawnApple(this.applesToSpwan);
    this.lastTick = Date.now();
    this.update();
  }

  addEventListeners() {
    addEventListener("keydown", (event) => {
      if (this.perviousDirection === Direction.ArrowDown && event.key === Direction.ArrowUp) {
        return;
      }
      else if (this.perviousDirection === Direction.ArrowUp && event.key === Direction.ArrowDown) {
        return;
      }
      else if (this.perviousDirection === Direction.ArrowLeft && event.key === Direction.ArrowRight) {
        return;
      }
      else if (this.perviousDirection === Direction.ArrowRight && event.key === Direction.ArrowLeft) {
        return;
      }
      this.direction = Direction[event.key] ?? this.direction;
    });
  }

  update() {
    if (this.won) {
      console.log("won")
      confettiElementRef.innerHTML = new Array(25).fill(`<div class="confetti-piece"></div>`).join("");
      return;
    }
    if (this.lost) {
      console.log("lost");
      return;
    }

    if (Date.now() - this.lastTick < this.tickSpeed) {
      requestAnimationFrame(this.update.bind(this));
      return;
    }

    this.lastTick = Date.now();
    this.perviousDirection = this.direction;

    let last = this.body[this.body.length - 1] ?? this.head.clone();
    if (this.body.length > 0) {
      this.body = [this.head.clone(), ...this.body.slice(0, -1)];
    }

    if (this.direction === Direction.ArrowDown) {
      this.head.y += 1;
    }
    else if (this.direction === Direction.ArrowUp) {
      this.head.y -= 1;
    }
    else if (this.direction === Direction.ArrowRight) {
      this.head.x += 1;
    }
    else if (this.direction === Direction.ArrowLeft) {
      this.head.x -= 1;
    }

    if (this.apples.some(a => a.equals(this.head))) {
      this.score += 1;
      scoreElementRef.innerText = `Score: ${this.score}`;
      this.apples = this.apples.filter(a => !a.equals(this.head));

      this.body = [...this.body, last];
      this.checkWinCondition();

      if (!this.won) {
        this.spawnApple(this.applesToSpwan);
      }
    }
    else {
      this.checkLooseCondition();
    }

    this.draw();

    requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    // Clear the canvas
    canvasCtx.clearRect(0, 0, boardContainerElementRef.width, boardContainerElementRef.height);
    // Draw the snake head
    this.drawHelper(this.head.x, this.head.y, this.headColor);
    // Draw the snake body
    for (let i = 0; i < this.body.length; i++) {
      const bodyPart = this.body[i];
      this.drawHelper(bodyPart.x, bodyPart.y, this.bodyColor);
    }
    // Draw the apples
    for (let i = 0; i < this.apples.length; i++) {
      const apple = this.apples[i];
      this.drawHelper(apple.x, apple.y, this.appleColor);
    }
  }

  spawnApple(amount) {
    let spawned = 0;

    while (spawned !== amount) {
      let randomPos = new Point(this.getRandomInt(this.ratio), this.getRandomInt(this.ratio));

      if (!this.head.equals(randomPos) && this.body.every(b => !b.equals(randomPos)) && this.apples.every(a => !a.equals(randomPos))) {
        this.apples.push(randomPos);
        spawned++;
      }
    }
  }

  checkLooseCondition() {
    const x = this.head.x * (this.width / this.ratio);
    const y = this.head.y * (this.height / this.ratio);
    // If the head is outside of the map or has collided with a body part
    if (x < 0 || x >= this.width || y < 0 || y >= this.height || this.body.some(b => b.equals(this.head))) {
      this.lost = true;
    }
  }

  checkWinCondition() {
    // + 1 because the head takes up one space
    this.won = this.score + 1 === (this.ratio * this.ratio);
  }

  drawHelper(x, y, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}


const Direction = {
  "None": "None",
  "ArrowDown": "ArrowDown",
  "ArrowUp": "ArrowUp",
  "ArrowRight": "ArrowRight",
  "ArrowLeft": "ArrowLeft"
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


let game;

resetBtnElementRef.addEventListener("click", () => {
  game = new Snake();
});

resetBtnElementRef.click();