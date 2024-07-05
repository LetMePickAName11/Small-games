import { GameLogicResponse } from "../../models/game_logic_response";
import { OSCVrChatGameLogic } from "../../models/osc_vrchat_game_logic";

export class TexasHoldThem implements OSCVrChatGameLogic {

  constructor(){
    this.dealTheFlop();
  }

  public getState(): { [key in string]: number } {
    return {
      Community_Card_1: this.getCard(null, 0),
      Community_Card_2: this.getCard(null, 1),
      Community_Card_3: this.getCard(null, 2),
      Community_Card_4: this.getCard(null, 3),
      Community_Card_5: this.getCard(null, 4),
      Community_Pool: this.getPool(null),
      Bet_Value: this.getBetValue(),
      Player_Turn: this.getPlayerTurn(),
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
  private getPlayerTurn(): number {
    return this._gameInfo.playerTurnIndex;
  }
  private getBetValue(): number {
    return this._gameInfo.communityBetSize;
  }
  private getPool(index: number | null): number {
    if (index === null) {
      return this._gameInfo.communityPool;
    }

    return this._playerInfo[index]!.pool;
  }
  private getCard(index: number | null, cardIndex: number): number {
    let card: Card;
    
    if (index === null) {
      card = this._gameInfo.communityCards[cardIndex]!;
    }
    else {
      card = this._playerInfo[index]?.cards[cardIndex]!;
    }

    if (card === undefined || card.isFaceDown) {
      return this._hiddenCardIndex;
    }

    return this._cardIndexMap.get([card.rank, card.suit])!;
  }

  public handleInput(inputString: string): GameLogicResponse {
    const inputNumber: number = Number(inputString.split('_')[1]);

    if (this._gameInfo.pauseInput) {
      return { updateVrc: false, message: null };
    }

    if (this._gameInfo.gameState === 'The Flop') {
      return this.dealTheFlop();
    }
    if (this._gameInfo.gameState === 'PlayerInput') {
      // Iterate through players who are out, all out or folded
      return this.playerTurn(inputNumber);
    }
    if (this._gameInfo.gameState === 'The Turn'){
      return this.dealTheTurn();
    }
    if (this._gameInfo.gameState === 'The River'){
      return this.dealTheRiver();
    }
    if (this._gameInfo.gameState === 'Reveal') {
      return this.reveal();
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
   ${`${this._gameInfo.communityCards[0]!.rank} of ${this._gameInfo.communityCards[0]!.suit} is ${this._gameInfo.communityCards[0]!.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[1]!.rank} of ${this._gameInfo.communityCards[1]!.suit} is ${this._gameInfo.communityCards[1]!.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[2]!.rank} of ${this._gameInfo.communityCards[2]!.suit} is ${this._gameInfo.communityCards[2]!.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[3]!.rank} of ${this._gameInfo.communityCards[3]!.suit} is ${this._gameInfo.communityCards[3]!.isFaceDown ? 'facedown' : 'faceup'}`}
   ${`${this._gameInfo.communityCards[4]!.rank} of ${this._gameInfo.communityCards[4]!.suit} is ${this._gameInfo.communityCards[4]!.isFaceDown ? 'facedown' : 'faceup'}`}
Input paused: ${this._gameInfo.pauseInput}

Player 1:
 ${`Index: ${this._playerInfo[0]!.index}`}
 ${`Pool: ${this._playerInfo[0]!.pool}`}
 Cards:
    ${this._playerInfo[0]!.cards[0]!.rank} of ${this._playerInfo[0]!.cards[0]!.suit} is ${this._playerInfo[0]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[0]!.cards[1]!.rank} of ${this._playerInfo[0]!.cards[1]!.suit} is ${this._playerInfo[0]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 2:
 ${`Index: ${this._playerInfo[1]!.index}`}
 ${`Pool: ${this._playerInfo[1]!.pool}`}
 Cards:
    ${this._playerInfo[1]!.cards[0]!.rank} of ${this._playerInfo[1]!.cards[0]!.suit} is ${this._playerInfo[1]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[1]!.cards[1]!.rank} of ${this._playerInfo[1]!.cards[1]!.suit} is ${this._playerInfo[1]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 3:
 ${`Index: ${this._playerInfo[2]!.index}`}
 ${`Pool: ${this._playerInfo[2]!.pool}`}
 Cards:
    ${this._playerInfo[2]!.cards[0]!.rank} of ${this._playerInfo[2]!.cards[0]!.suit} is ${this._playerInfo[2]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[2]!.cards[1]!.rank} of ${this._playerInfo[2]!.cards[1]!.suit} is ${this._playerInfo[2]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 4:
 ${`Index: ${this._playerInfo[3]!.index}`}
 ${`Pool: ${this._playerInfo[3]!.pool}`}
 Cards:
    ${this._playerInfo[3]!.cards[0]!.rank} of ${this._playerInfo[3]!.cards[0]!.suit} is ${this._playerInfo[3]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[3]!.cards[1]!.rank} of ${this._playerInfo[3]!.cards[1]!.suit} is ${this._playerInfo[3]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 5:
 ${`Index: ${this._playerInfo[4]!.index}`}
 ${`Pool: ${this._playerInfo[4]!.pool}`}
 Cards:
    ${this._playerInfo[4]!.cards[0]!.rank} of ${this._playerInfo[4]!.cards[0]!.suit} is ${this._playerInfo[4]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[4]!.cards[1]!.rank} of ${this._playerInfo[4]!.cards[1]!.suit} is ${this._playerInfo[4]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 6:
 ${`Index: ${this._playerInfo[5]!.index}`}
 ${`Pool: ${this._playerInfo[5]!.pool}`}
 Cards:
    ${this._playerInfo[5]!.cards[0]!.rank} of ${this._playerInfo[5]!.cards[0]!.suit} is ${this._playerInfo[5]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[5]!.cards[1]!.rank} of ${this._playerInfo[5]!.cards[1]!.suit} is ${this._playerInfo[5]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 7:
 ${`Index: ${this._playerInfo[6]!.index}`}
 ${`Pool: ${this._playerInfo[6]!.pool}`}
 Cards:
    ${this._playerInfo[6]!.cards[0]!.rank} of ${this._playerInfo[6]!.cards[0]!.suit} is ${this._playerInfo[6]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[6]!.cards[1]!.rank} of ${this._playerInfo[6]!.cards[1]!.suit} is ${this._playerInfo[6]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}

Player 8:
 ${`Index: ${this._playerInfo[7]!.index}`}
 ${`Pool: ${this._playerInfo[7]!.pool}`}
 Cards:
    ${this._playerInfo[7]!.cards[0]!.rank} of ${this._playerInfo[7]!.cards[0]!.suit} is ${this._playerInfo[7]!.cards[0]!.isFaceDown ? 'facedown' : 'faceup'}
    ${this._playerInfo[7]!.cards[1]!.rank} of ${this._playerInfo[7]!.cards[1]!.suit} is ${this._playerInfo[7]!.cards[1]!.isFaceDown ? 'facedown' : 'faceup'}
    `;
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
      gameState: 'PlayerInput'
    };
    this._gameInfo.communityCards.push(this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard());
    this._gameInfo.communityCards[0]!.isFaceDown = false;
    this._gameInfo.communityCards[1]!.isFaceDown = false;
    this._gameInfo.communityCards[2]!.isFaceDown = false;
    // Reset player and deal 2 cards
    this._playerInfo.forEach((p) => {
      p.bet = 0;
      p.cards = [this.dealCard(), this.dealCard()];
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

    if (player.gameState === 'Picking') {
      // Call
      if (inputNumber === 1) {
        this.iteratePlayerIndex();
        this.bet(player.index, this._gameInfo.communityBetSize);
      } // Raise
      else if (inputNumber === 2) {
        player.gameState = 'Raising';
      } // All in
      else if (inputNumber === 3) {
        this.bet(player.index, player.pool);
        this.iteratePlayerIndex();
        player.gameState = 'AllOut';
      } // Fold
      else if (inputNumber === 4) {
        this.iteratePlayerIndex();
        player.gameState = 'Out';
      }
    }
    else if (player.gameState === 'Raising') {
      // Increment amount
      if (inputNumber === 0) {
        if(player.raiseInfo === null){
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
        this.iteratePlayerIndex();
      }
    }
    else {
      throw Error('Something broke boss-man');
    }

    return {
      updateVrc: true,
      message: null
    }
  }

  private iteratePlayerIndex(): void {
    // Fix so player index is iterated correctly
    const currentIndex: number = this._gameInfo.playerTurnIndex;
    this._gameInfo.playerTurnIndex = this._gameInfo.playerTurnIndex + 1 === 8 ? 0 : this._gameInfo.playerTurnIndex + 1;

    if (this._gameInfo.blindIndex === currentIndex) {
      if (this._gameInfo.communityCards[4]!.isFaceDown === false) {
        this._gameInfo.gameState = 'Reveal';
      }
      else if (this._gameInfo.communityCards[3]!.isFaceDown === false) {
        this._gameInfo.gameState = 'The River';
      }
      else {
        this._gameInfo.gameState = 'The Turn';
      }
    }
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
    const flush: Array<Card> | undefined = Object.values(kinds).find((v: Array<Card>) => v.length >= 5);
    const fourOfAKind = Object.values(kinds).find((v) => v.length === 4);
    const ThreeOfAKind = Object.values(kinds).filter((v) => v.length === 3);
    const TwoOfAKind = Object.values(kinds).filter((v) => v.length === 2);

    // Royal flush
    if (straight && flush) {
      return {
        type: 9,
        highValue: 0,
        kickerValue: 0
      };
    }
    // Straight flush
    if (straight && flush) {
      return {
        type: 8,
        highValue: 0,
        kickerValue: 0
      };
    }
    // Four of a kind
    if (fourOfAKind !== undefined) {
      return {
        type: 7,
        highValue: 0,
        kickerValue: 0
      };
    }
    // Full house
    if (ThreeOfAKind.length !== 0 && TwoOfAKind.length !== 0) {
      return {
        type: 6,
        highValue: 0,
        kickerValue: 0
      };
    }
    // flush
    if (flush) {
      return {
        type: 5,
        highValue: 0,
        kickerValue: 0
      };
    }
    // Straight
    if (straight) {
      return {
        type: 4,
        highValue: 0,
        kickerValue: 0,
      };
    }
    // Three of a kind
    if (ThreeOfAKind.length !== 0) {
      return {
        type: 3,
        highValue: 0,
        kickerValue: 0,
      };
    }
    // Two pair
    if (TwoOfAKind.length > 1) {
      return {
        type: 2,
        highValue: 0,
        kickerValue: 0,
      };
    }
    // Pair
    if (TwoOfAKind.length > 0) {
      return {
        type: 1,
        highValue: 0,
        kickerValue: 0,
      };
    }
    // High card
    return {
      type: 0,
      highValue: hand.reduce((acc, cv) => acc = cv.value > acc ? cv.value : acc, 0),
      kickerValue: hand.reduce((acc, cv) => acc = cv.value < acc ? cv.value : acc, 14),
    };
  }

  private getKindsFromCards(sorted: Array<Card>): { [key in string]: Array<Card> } {
    return Object.entries({
      Ace: sorted.filter((card: Card) => card.rank === 'Ace'),
      Two: sorted.filter((card: Card) => card.rank === 'Two'),
      Three: sorted.filter((card: Card) => card.rank === 'Three'),
      Four: sorted.filter((card: Card) => card.rank === 'Four'),
      Five: sorted.filter((card: Card) => card.rank === 'Five'),
      Six: sorted.filter((card: Card) => card.rank === 'Six'),
      Seven: sorted.filter((card: Card) => card.rank === 'Seven'),
      Eight: sorted.filter((card: Card) => card.rank === 'Eight'),
      Nine: sorted.filter((card: Card) => card.rank === 'Nine'),
      Ten: sorted.filter((card: Card) => card.rank === 'Ten'),
      Jack: sorted.filter((card: Card) => card.rank === 'Jack'),
      Queen: sorted.filter((card: Card) => card.rank === 'Queen'),
      King: sorted.filter((card: Card) => card.rank === 'King'),
    }).reduce((acc, cv) => {
      if (cv[1].length === 0) {
        return acc;
      }

      acc[cv[0]] = cv[1];
      return acc;
    }, {} as { [key in string]: Array<Card> });
  }

  private getStraightFromCards(sorted: Array<Card>): Array<Card> {
    const uniqueSorted = Array.from(new Set(sorted.map(card => card.value))).sort((a, b) => b - a);
    const straight: Array<Card> = [];

    for (let i = 0; i <= uniqueSorted.length - 5; i++) {
      const first = uniqueSorted[i]!;
      const second = uniqueSorted[i + 1]!;
      const third = uniqueSorted[i + 2]!;
      const fourth = uniqueSorted[i + 3]!;
      const fifth = uniqueSorted[i + 4]!;

      if (first + 1 === second && first + 2 === third && first + 3 === fourth && first + 4 === fifth) {
        straight.push(
          sorted.find(card => card.value === first)!,
          sorted.find(card => card.value === second)!,
          sorted.find(card => card.value === third)!,
          sorted.find(card => card.value === fourth)!,
          sorted.find(card => card.value === fifth)!
        );
        break;
      }
    }

    // Check for wheel straight (A-2-3-4-5)
    if (!straight.length && uniqueSorted.includes(14) && uniqueSorted.includes(2) && uniqueSorted.includes(3) && uniqueSorted.includes(4) && uniqueSorted.includes(5)) {
      straight.push(
        sorted.find(card => card.value === 5)!,
        sorted.find(card => card.value === 4)!,
        sorted.find(card => card.value === 3)!,
        sorted.find(card => card.value === 2)!,
        sorted.find(card => card.value === 14)! // Ace
      );
    }

    return straight;
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

    for (const [rank, suit] of this._cardIndexMap.keys()) {
      deck.push({
        rank: rank,
        suit: suit,
        isFaceDown: true,
        value: this._cardRankValueMap.get(rank)!
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



  private _playerInfo: Array<PlayerInfo> = [
    {
      index: 0,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 1,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 2,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 3,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 4,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 5,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 6,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    },
    {
      index: 7,
      pool: 255,
      bet: 0,
      cards: [],
      gameState: 'Picking',
      raiseInfo: null,
    }
  ];
  private _gameInfo: gameInfo = {
    communityPool: -1,
    communityBetSize: -1,
    communityCards: [],
    blindIndex: -1,
    playerTurnIndex: 0,
    deck: [],
    pauseInput: true,
    gameState: 'The Flop'
  };

  private readonly _cardIndexMap: Map<[rank: CardRank, suit: CardSuit], number> = new Map<[rank: CardRank, suit: CardSuit], number>([
    [['Ace', 'Club'], 0],
    [['Two', 'Club'], 1],
    [['Three', 'Club'], 2],
    [['Four', 'Club'], 3],
    [['Five', 'Club'], 4],
    [['Six', 'Club'], 5],
    [['Seven', 'Club'], 6],
    [['Eight', 'Club'], 7],
    [['Nine', 'Club'], 8],
    [['Ten', 'Club'], 9],
    [['Jack', 'Club'], 10],
    [['Queen', 'Club'], 11],
    [['King', 'Club'], 12],
    [['Ace', 'Diamond'], 13],
    [['Two', 'Diamond'], 14],
    [['Three', 'Diamond'], 15],
    [['Four', 'Diamond'], 16],
    [['Five', 'Diamond'], 17],
    [['Six', 'Diamond'], 18],
    [['Seven', 'Diamond'], 19],
    [['Eight', 'Diamond'], 20],
    [['Nine', 'Diamond'], 21],
    [['Ten', 'Diamond'], 22],
    [['Jack', 'Diamond'], 23],
    [['Queen', 'Diamond'], 24],
    [['King', 'Diamond'], 25],
    [['Ace', 'Heart'], 26],
    [['Two', 'Heart'], 27],
    [['Three', 'Heart'], 28],
    [['Four', 'Heart'], 29],
    [['Five', 'Heart'], 30],
    [['Six', 'Heart'], 31],
    [['Seven', 'Heart'], 32],
    [['Eight', 'Heart'], 33],
    [['Nine', 'Heart'], 34],
    [['Ten', 'Heart'], 35],
    [['Jack', 'Heart'], 36],
    [['Queen', 'Heart'], 37],
    [['King', 'Heart'], 38],
    [['Ace', 'spade'], 39],
    [['Two', 'spade'], 40],
    [['Three', 'spade'], 41],
    [['Four', 'spade'], 42],
    [['Five', 'spade'], 43],
    [['Six', 'spade'], 44],
    [['Seven', 'spade'], 45],
    [['Eight', 'spade'], 46],
    [['Nine', 'spade'], 47],
    [['Ten', 'spade'], 48],
    [['Jack', 'spade'], 49],
    [['Queen', 'spade'], 50],
    [['King', 'spade'], 51],
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
type CardSuit = 'Club' | 'Diamond' | 'Heart' | 'spade';

interface Card {
  rank: CardRank;
  suit: CardSuit;
  isFaceDown: boolean;
  value: number;
}

interface gameInfo {
  communityPool: number;
  communityBetSize: number;
  communityCards: Array<Card>;
  blindIndex: number;
  playerTurnIndex: number;
  deck: Array<Card>;
  pauseInput: boolean;
  gameState: 'The Turn' | 'The River' | 'The Flop' | 'PlayerInput' | 'Reveal';
}