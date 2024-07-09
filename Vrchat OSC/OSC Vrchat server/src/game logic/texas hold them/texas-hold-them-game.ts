import { GameLogicResponse } from "../../models/game_logic_response";
import { OSCVrChatGameLogic } from "../../models/osc_vrchat_game_logic";

export class TexasHoldThem implements OSCVrChatGameLogic {
  public getState(): { [key in string]: number } {
    return {
      Community_Card_1: this.getCard(null, 0),
      Community_Card_2: this.getCard(null, 1),
      Community_Card_3: this.getCard(null, 2),
      Community_Card_4: this.getCard(null, 3),
      Community_Card_5: this.getCard(null, 4),
      Community_Pool: this.getPool(null),
      Bet_Value: this.getBetValue(),
      Player_1_Turn: this.getPlayerTurn(1),
      Player_2_Turn: this.getPlayerTurn(2),
      Player_3_Turn: this.getPlayerTurn(3),
      Player_4_Turn: this.getPlayerTurn(4),
      Player_5_Turn: this.getPlayerTurn(5),
      Player_6_Turn: this.getPlayerTurn(6),
      Player_7_Turn: this.getPlayerTurn(7),
      Player_8_Turn: this.getPlayerTurn(8),
      Blind: this.getBlind(),
      Player_1_Card_1: this.getCard(0, 0),
      Player_1_Card_2: this.getCard(0, 1),
      Player_2_Card_1: this.getCard(1, 0),
      Player_2_Card_2: this.getCard(1, 1),
      Player_3_Card_1: this.getCard(2, 0),
      Player_3_Card_2: this.getCard(2, 1),
      Player_4_Card_1: this.getCard(3, 0),
      Player_4_Card_2: this.getCard(3, 1),
      Player_5_Card_1: this.getCard(4, 0),
      Player_5_Card_2: this.getCard(4, 1),
      Player_6_Card_1: this.getCard(5, 0),
      Player_6_Card_2: this.getCard(5, 1),
      Player_7_Card_1: this.getCard(6, 0),
      Player_7_Card_2: this.getCard(6, 1),
      Player_8_Card_1: this.getCard(7, 0),
      Player_8_Card_2: this.getCard(7, 1),
      Player_1_Pool: this.getPool(0),
      Player_2_Pool: this.getPool(1),
      Player_3_Pool: this.getPool(2),
      Player_4_Pool: this.getPool(3),
      Player_5_Pool: this.getPool(4),
      Player_6_Pool: this.getPool(5),
      Player_7_Pool: this.getPool(6),
      Player_8_Pool: this.getPool(7)
    };
  }
  private getBlind(): number {
    return this._gameInfo.blindIndex;
  }
  private getPlayerTurn(playerIndex: number): number {
    return this._gameInfo.playerTurnIndex === playerIndex ? 1 : 0;
  }
  private getBetValue(): number {
    return this._gameInfo.communityBetSize;
  }
  private getPool(index: number | null): number {
    if (!this._gameInfo.setup.complete) {
      return 0;
    }
    if (index === null) {
      return this._gameInfo.communityPool;
    }
    if (index > this._gameInfo.setup.playerCount - 1) {
      return 0;
    }

    return this._playerInfo[index]!.pool;
  }
  private getCard(index: number | null, cardIndex: number): number {
    let card: Card;

    if (!this._gameInfo.setup.complete) {
      return this._hiddenCardIndex;
    }

    if (index === null) {
      card = this._gameInfo.communityCards[cardIndex]!;
    }
    else if (index > this._gameInfo.setup.playerCount - 1) {
      return this._hiddenCardIndex;
    }
    else {
      card = this._playerInfo[index]?.cards[cardIndex]!;
    }

    if (card === undefined || card.isFaceDown) {
      return this._hiddenCardIndex;
    }

    return this._cardIndexMap.get(`${card.rank}_${card.suit}`)!;
  }

  public handleInput(inputString: string): GameLogicResponse {
    const inputNumber: number = Number(inputString.split('_')[1]);

    if (this._gameInfo.pauseInput) {
      return { updateVrc: false, message: null };
    }

    if (this._gameInfo.gameState === 'Setup') {
      return this.setupGame(inputNumber);
    }
    if (this._gameInfo.gameState === 'The Flop') {
      return this.dealTheFlop();
    }
    if (this._gameInfo.gameState === 'PlayerInput') {
      // Iterate through players who are out, all out or folded
      for (let i = 0; i < this._gameInfo.setup.playerCount; i++) {
        this._playerInfo.push(
          {
            index: i,
            pool: 255,
            bet: 0,
            cards: [],
            gameState: 'Picking',
            raiseInfo: null,
          }
        );
      }
      return this.playerTurn(inputNumber);
    }

    return { updateVrc: false, message: null };
  }

  public debugInfo(): string {
    return `
Game state: ${this._gameInfo.gameState}
Blind: ${this._gameInfo.blindIndex}
Player turn: ${this._gameInfo.playerTurnIndex}
Bet size: ${this._gameInfo.communityBetSize}
Community pool: ${this._gameInfo.communityPool}
Cards: 
   ${`${this._gameInfo.communityCards[0]?.rank} of ${this._gameInfo.communityCards[0]?.suit} is ${this._gameInfo.communityCards[0]?.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[1]?.rank} of ${this._gameInfo.communityCards[1]?.suit} is ${this._gameInfo.communityCards[1]?.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[2]?.rank} of ${this._gameInfo.communityCards[2]?.suit} is ${this._gameInfo.communityCards[2]?.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[3]?.rank} of ${this._gameInfo.communityCards[3]?.suit} is ${this._gameInfo.communityCards[3]?.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[4]?.rank} of ${this._gameInfo.communityCards[4]?.suit} is ${this._gameInfo.communityCards[4]?.isFaceDown ? 'facedown' : 'faceup'}`}
Input paused: ${this._gameInfo.pauseInput}

${this._playerInfo.map(pi => this.getPlayerInfo(pi.index))}
    `;
  }

  private getPlayerInfo(playerIndex: number) {
    const player = this._playerInfo[playerIndex]!;
    const handRank = this.handRank(player.cards);
    return `
    Player ${playerIndex + 1}:
    ${`Index: ${player.index}`}
    ${`Pool: ${player.pool}`}
    Cards: ${handRank.type} | high: ${handRank.highValue} | kicker: ${handRank.kickerValue}
        ${player.cards[0]!.rank} of ${player.cards[0]!.suit} is ${player.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
        ${player.cards[1]!.rank} of ${player.cards[1]!.suit} is ${player.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}
    `;
  }



  private setupGame(inputNumber: number): GameLogicResponse {
    // Increase player count
    if (inputNumber === 1) {
      this._gameInfo.setup.playerCount = this._gameInfo.setup.playerCount + 1 > 8 ? 8 : this._gameInfo.setup.playerCount + 1;
    } // Decrease player count
    else if (inputNumber === 2) {
      this._gameInfo.setup.playerCount = this._gameInfo.setup.playerCount - 1 < 2 ? 2 : this._gameInfo.setup.playerCount - 1;
    } // Reset
    else if (inputNumber === 3) {
      this._gameInfo.setup.playerCount = 2;
    } // Confirm
    else if (inputNumber === 4) {
      this._gameInfo.setup.complete = true;
      return this.dealTheFlop();
    }

    return {
      message: `Player count: ${this._gameInfo.setup.playerCount}`,
      updateVrc: true
    }
  }

  private dealTheFlop(): GameLogicResponse {
    // Generate a deck
    const deck: Array<Card> = this.generateDeck();
    // Update who is the blind
    const blindIndex: number = this._gameInfo.blindIndex === 7 ? 0 : this._gameInfo.blindIndex + 1;
    // Reset game info
    this._gameInfo = {
      communityPool: 0,
      communityBetSize: 0,
      communityCards: [],
      blindIndex: blindIndex,
      playerTurnIndex: blindIndex + 1,
      deck: deck,
      pauseInput: true,
      gameState: 'PlayerInput',
      setup: this._gameInfo.setup
    };
    this._gameInfo.communityCards.push(this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard());
    this._gameInfo.communityCards[0]!.isFaceDown = false;
    this._gameInfo.communityCards[1]!.isFaceDown = false;
    this._gameInfo.communityCards[2]!.isFaceDown = false;
    // Reset player and deal 2 cards
    this._playerInfo.forEach((p) => {
      p.bet = 0;
      p.cards = [this.dealCard(), this.dealCard()];
      p.cards.forEach(c => c.isFaceDown = false)
    });

    // Mandatory blind bet
    this.bet(blindIndex, 5);
    // Wait for animations and then start
    setTimeout(() => {
      this._gameInfo.pauseInput = false;
    }, 500);

    return {
      message: null,
      updateVrc: true
    }
  }

  private dealTheTurn(): GameLogicResponse {
    this._gameInfo.communityCards[3]!.isFaceDown = false;
    this._gameInfo.gameState = 'PlayerInput';

    return {
      message: `${this._gameInfo.communityCards[3]!.rank} of ${this._gameInfo.communityCards[3]!.suit}s`,
      updateVrc: true
    };
  }

  private dealTheRiver(): GameLogicResponse {
    this._gameInfo.communityCards[4]!.isFaceDown = false;
    this._gameInfo.gameState = 'PlayerInput';

    return {
      message: `${this._gameInfo.communityCards[4]!.rank} of ${this._gameInfo.communityCards[3]!.suit}s`,
      updateVrc: true
    };
  }

  private reveal(): GameLogicResponse {
    this.revealCommunityCard();
    this.revealPlayerCards();

    const winningPlayers = this._playerInfo.reduce((acc, cv: PlayerInfo): { players: Array<PlayerInfo>, type: number, highValue: number, kickerValue: number | null } => {
      const handRank = this.handRank(cv.cards);

      if (acc.type < handRank.type) {
        acc.players = [cv];
        acc.highValue = handRank.highValue;
        acc.kickerValue = handRank.kickerValue;
        acc.type = handRank.type;
      }
      else if (acc.type === handRank.type) {
        if (acc.highValue < handRank.highValue) {
          acc.players = [cv];
          acc.highValue = handRank.highValue;
          acc.kickerValue = handRank.kickerValue;
        }
        else if (acc.highValue === handRank.highValue) {
          if (acc.kickerValue === null && handRank.kickerValue === null) {
            acc.players.push(cv);
          }
          else if (handRank.kickerValue !== null && (acc.kickerValue === null || acc.kickerValue < handRank.kickerValue)) {
            acc.players = [cv];
            acc.kickerValue = handRank.kickerValue;
          }
        }
      }

      return acc;
    }, { players: [], type: 0, highValue: 0, kickerValue: null } as { players: Array<PlayerInfo>, type: number, highValue: number, kickerValue: number | null });
    let winningText: string = '';

    if (winningPlayers.players.length > 1) {
      const split = Math.floor(this._gameInfo.communityPool / winningPlayers.players.length);
      const winnerWinnerChickenDinner: number = this._gameInfo.communityPool % 2 === 1 ? this.getRandomInt(winningPlayers.players.length) : 0;

      winningPlayers.players.forEach((pl) => { pl.pool += split; });

      if (winnerWinnerChickenDinner !== -1) {
        winningPlayers.players[winnerWinnerChickenDinner]!.pool += 1;
      }

      winningText = `Players ${winningPlayers.players.map(p => `'${p.index}'`)} won ${this._gameInfo.communityPool}$ each`;
    }
    else {
      const winningPlayer = winningPlayers.players[0]!;
      winningPlayer.pool += this._gameInfo.communityPool;
      winningText = `Player '${winningPlayer.index}' won ${this._gameInfo.communityPool}$`;
    }

    this._gameInfo.pauseInput = true;
    this._gameInfo.gameState = 'The Flop';
    this._gameInfo.communityPool = 0;

    return {
      message: winningText,
      updateVrc: true
    };
  }

  private playerTurn(inputNumber: number): GameLogicResponse {
    const player = this._playerInfo[this._gameInfo.playerTurnIndex]!;
    let gameLogicResponse: GameLogicResponse | null = null;

    if (player.gameState === 'Picking') {
      // Call
      if (inputNumber === 1) {
        this.bet(player.index, this._gameInfo.communityBetSize);
        gameLogicResponse = this.iteratePlayerIndex();
      } // Raise
      else if (inputNumber === 2) {
        player.gameState = 'Raising';
      } // All in
      else if (inputNumber === 3) {
        this.bet(player.index, player.pool);
        gameLogicResponse = this.iteratePlayerIndex();
        player.gameState = 'AllOut';
      } // Fold
      else if (inputNumber === 4) {
        gameLogicResponse = this.iteratePlayerIndex();
        player.gameState = 'Out';
      }
    }
    else if (player.gameState === 'Raising') {
      // Increment amount
      if (inputNumber === 0) {
        if (player.raiseInfo === null) {
          player.raiseInfo = 1;
        }
        else {
          let currentIndex: number = this._betIntervals.findIndex(player.raiseInfo);
          currentIndex = currentIndex === this._betIntervals.length - 1 ? 0 : currentIndex + 1;
          player.raiseInfo = this._betIntervals[currentIndex];
        }
      } // Increase
      else if (inputNumber === 1) {
        player.bet += player.raiseInfo;
        player.bet = Math.min(player.bet, player.pool);
      } // Reduce
      else if (inputNumber === 2) {
        player.bet += player.raiseInfo;
        player.bet = Math.max(player.bet, this._gameInfo.communityBetSize);
      } // Confirm
      else if (inputNumber === 3) {
        this.bet(player.index, player.bet);
        gameLogicResponse = this.iteratePlayerIndex();
      }
    }
    else {
      throw Error('Something broke boss-man');
    }

    if (gameLogicResponse === null) {
      gameLogicResponse = {
        updateVrc: true,
        message: null
      }
    }

    return gameLogicResponse;
  }

  private iteratePlayerIndex(): GameLogicResponse | null {
    // Fix so player index is iterated correctly
    const currentIndex: number = this._gameInfo.playerTurnIndex;
    this._gameInfo.playerTurnIndex = (this._gameInfo.playerTurnIndex + 1) % this._gameInfo.setup.playerCount;

    if (this._gameInfo.blindIndex === currentIndex) {
      if (this._gameInfo.communityCards[4]!.isFaceDown === false) {
        this._gameInfo.gameState = 'Reveal';
        return this.reveal();
      }
      else if (this._gameInfo.communityCards[3]!.isFaceDown === false) {
        this._gameInfo.gameState = 'The River';
        return this.dealTheRiver();
      }
      else {
        this._gameInfo.gameState = 'The Turn';
        return this.dealTheTurn();
      }
    }

    return null;
  }

  private revealCommunityCard(): void {
    this._gameInfo.deck.forEach((card: Card) => card.isFaceDown = false);
  }

  private revealPlayerCards(): void {
    this._playerInfo.forEach((playerInfo: PlayerInfo) => playerInfo.cards.forEach((card: Card) => card.isFaceDown = false));
  }

  private handRank(hand: Array<Card>): { type: number; highValue: number; kickerValue: number | null; } {
    const sorted: Array<Card> = [...hand, ...this._gameInfo.communityCards].sort((a: Card, b: Card) => b.value - a.value);
    const kinds: { [key in string]: Array<Card> } = this.getKindsFromCards(sorted);
    const straight: Array<Card> = this.getStraightFromCards(sorted);
    const flush: Array<Card> = Object.values(kinds).find((v: Array<Card>) => v.length >= 5) ?? [];
    const fourOfAKind = Object.values(kinds).find((v) => v.length === 4);
    const ThreeOfAKind = Object.values(kinds).filter((v) => v.length === 3);
    const TwoOfAKind = Object.values(kinds).filter((v) => v.length === 2);

    const getHighValue = (cards: Array<Card>): number => cards[0]?.value || 0;
    const getKickerValue = (cards: Array<Card>): number | null => {
      const handValues = hand.map(card => card.value);
      for (const card of cards) {
        if (!handValues.includes(card.value)) {
          return card.value;
        }
      }
      return null;
    };

    // Royal flush
    if (straight.length === 5 && flush.length >= 4 && straight.every((card: Card) => card.suit === flush[0]?.suit) && getHighValue(straight) === 14) {
      return {
        type: 9,
        highValue: getHighValue(straight),
        kickerValue: null
      };
    }
    // Straight flush
    if (straight.length === 5 && flush.length >= 4 && straight.every((card: Card) => card.suit === flush[0]?.suit)) {
      return {
        type: 8,
        highValue: getHighValue(straight),
        kickerValue: null
      };
    }
    // Four of a kind
    if (fourOfAKind !== undefined) {
      return {
        type: 7,
        highValue: getHighValue(fourOfAKind),
        kickerValue: getKickerValue(sorted.filter(card => card.value !== getHighValue(fourOfAKind)))
      };
    }
    // Full house
    if (ThreeOfAKind.length !== 0 && TwoOfAKind.length !== 0) {
      return {
        type: 6,
        highValue: getHighValue(ThreeOfAKind[0]!),
        kickerValue: getHighValue(TwoOfAKind[0]!)
      };
    }
    // Flush
    if (flush.length >= 5) {
      return {
        type: 5,
        highValue: getHighValue(flush),
        kickerValue: null
      };
    }
    // Straight
    if (straight.length === 5) {
      return {
        type: 4,
        highValue: getHighValue(straight),
        kickerValue: null
      };
    }
    // Three of a kind
    if (ThreeOfAKind.length !== 0) {
      return {
        type: 3,
        highValue: getHighValue(ThreeOfAKind[0]!),
        kickerValue: getKickerValue(sorted.filter(card => card.value !== getHighValue(ThreeOfAKind[0]!)))
      };
    }
    // Two pair
    if (TwoOfAKind.length > 1) {
      return {
        type: 2,
        highValue: getHighValue(TwoOfAKind[0]!),
        kickerValue: getHighValue(TwoOfAKind[1]!)
      };
    }
    // Pair
    if (TwoOfAKind.length > 0) {
      return {
        type: 1,
        highValue: getHighValue(TwoOfAKind[0]!),
        kickerValue: getKickerValue(sorted.filter(card => card.value !== getHighValue(TwoOfAKind[0]!)))
      };
    }
    // High card
    return {
      type: 0,
      highValue: getHighValue(sorted),
      kickerValue: getKickerValue(hand)
    };
  }

  private getKindsFromCards(sorted: Array<Card>): { [key in string]: Array<Card> } {
    return sorted.reduce((acc, card) => {
      if (!acc[card.rank]) {
        acc[card.rank] = []
      };
      acc[card.rank]!.push(card);
      return acc;
    }, {} as { [key in string]: Array<Card> });
  }

  private getStraightFromCards(sorted: Array<Card>): Array<Card> {
    const uniqueSorted = Array.from(new Set(sorted.map(card => card.value))).sort((a, b) => b - a);
    for (let i = 0; i <= uniqueSorted.length - 5; i++) {
      if (uniqueSorted.slice(i, i + 5).every((value, idx, arr) => value === arr[0]! - idx)) {
        return sorted.filter(card => uniqueSorted.slice(i, i + 5).includes(card.value));
      }
    }

    // Check for wheel straight (A-2-3-4-5)
    const wheel = [14, 5, 4, 3, 2];
    if (wheel.every(value => uniqueSorted.includes(value))) {
      return sorted.filter(card => wheel.includes(card.value));
    }

    return [];
  }

  private bet(playerIndex: number, amount: number) {
    this._playerInfo[playerIndex]!.bet = 0;
    this._playerInfo[playerIndex]!.pool -= amount;
    this._gameInfo.communityBetSize = amount;
    this._gameInfo.communityPool += amount;
  }

  private generateDeck(): Array<Card> {
    const deck: Array<Card> = [];
    const random = this.seedRandom(Date.now() * 3.1231 * Math.random() + 2);

    for (const key of this._cardIndexMap.keys()) {
      deck.push({
        rank: key.split('_')[0]! as CardRank,
        suit: key.split('_')[1]! as CardSuit,
        isFaceDown: true,
        value: this._cardRankValueMap.get(key.split('_')[0]! as CardRank)!
      });
    }

    let indexer: number;
    let card: Card;
    let deckIterator: number = deck.length;

    while (deckIterator) {
      indexer = Math.floor(random() * deckIterator--);
      card = deck[deckIterator]!;
      deck[deckIterator] = deck[indexer]!;
      deck[indexer] = card;
    }

    return deck;
  }

  private seedRandom(seed: number) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private dealCard(): Card {
    return this._gameInfo.deck.pop()!;
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }



  private _playerInfo: Array<PlayerInfo> = [];
  private _gameInfo: gameInfo = {
    communityPool: -1,
    communityBetSize: -1,
    communityCards: [],
    blindIndex: -1,
    playerTurnIndex: 0,
    deck: [],
    pauseInput: true,
    gameState: 'Setup',
    setup: {
      playerCount: 2,
      complete: false
    }
  };

  private readonly _cardIndexMap: Map<string, number> = new Map<string, number>([
    ['Ace_Club', 0],
    ['Two_Club', 1],
    ['Three_Club', 2],
    ['Four_Club', 3],
    ['Five_Club', 4],
    ['Six_Club', 5],
    ['Seven_Club', 6],
    ['Eight_Club', 7],
    ['Nine_Club', 8],
    ['Ten_Club', 9],
    ['Jack_Club', 10],
    ['Queen_Club', 11],
    ['King_Club', 12],
    ['Ace_Diamond', 13],
    ['Two_Diamond', 14],
    ['Three_Diamond', 15],
    ['Four_Diamond', 16],
    ['Five_Diamond', 17],
    ['Six_Diamond', 18],
    ['Seven_Diamond', 19],
    ['Eight_Diamond', 20],
    ['Nine_Diamond', 21],
    ['Ten_Diamond', 22],
    ['Jack_Diamond', 23],
    ['Queen_Diamond', 24],
    ['King_Diamond', 25],
    ['Ace_Heart', 26],
    ['Two_Heart', 27],
    ['Three_Heart', 28],
    ['Four_Heart', 29],
    ['Five_Heart', 30],
    ['Six_Heart', 31],
    ['Seven_Heart', 32],
    ['Eight_Heart', 33],
    ['Nine_Heart', 34],
    ['Ten_Heart', 35],
    ['Jack_Heart', 36],
    ['Queen_Heart', 37],
    ['King_Heart', 38],
    ['Ace_Spade', 39],
    ['Two_Spade', 40],
    ['Three_Spade', 41],
    ['Four_Spade', 42],
    ['Five_Spade', 43],
    ['Six_Spade', 44],
    ['Seven_Spade', 45],
    ['Eight_Spade', 46],
    ['Nine_Spade', 47],
    ['Ten_Spade', 48],
    ['Jack_Spade', 49],
    ['Queen_Spade', 50],
    ['King_Spade', 51],
  ]);
  private readonly _hiddenCardIndex: number = 52;
  private readonly _cardRankValueMap = new Map<CardRank, number>([
    ['Ace', 14],
    ['Two', 2],
    ['Three', 3],
    ['Four', 4],
    ['Five', 5],
    ['Six', 6],
    ['Seven', 7],
    ['Eight', 8],
    ['Nine', 9],
    ['Ten', 10],
    ['Jack', 11],
    ['Queen', 12],
    ['King', 13]
  ]);
  private readonly _betIntervals: Array<number> = [1, 2, 5, 10, 20, 50, 100, 200, 500];
}

interface PlayerInfo {
  index: number;
  pool: number;
  bet: number;
  cards: Array<Card>;
  gameState: 'Raising' | 'Out' | 'AllOut' | 'Picking';
  raiseInfo: any;
}

type CardRank = 'Ace' | 'Two' | 'Three' | 'Four' | 'Five' | 'Six' | 'Seven' | 'Eight' | 'Nine' | 'Ten' | 'Jack' | 'Queen' | 'King';
type CardSuit = 'Club' | 'Diamond' | 'Heart' | 'Spade';

interface Card {
  rank: CardRank;
  suit: CardSuit;
  isFaceDown: boolean;
  value: number;
}

interface gameInfo {
  setup: {
    playerCount: number;
    complete: boolean;
  };
  communityPool: number;
  communityBetSize: number;
  communityCards: Array<Card>;
  blindIndex: number;
  playerTurnIndex: number;
  deck: Array<Card>;
  pauseInput: boolean;
  gameState: 'The Turn' | 'The River' | 'The Flop' | 'PlayerInput' | 'Reveal' | 'Setup';
}