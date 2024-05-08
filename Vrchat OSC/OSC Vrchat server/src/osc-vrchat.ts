// @ts-ignore
import osc from 'osc';
//import * as fs from 'fs';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
// @ts-ignore
import fs from 'fs-extra';
import { OSCVrChatGameLogic } from './models/osc_vrchat_game_logic';
import { GameLogicResponse } from './models/game_logic_response';
import { SocketType } from './models/socket_type';
import { BitAllocation, EightBitChunkName, EightBitChunkNames, WebsocketName } from 'shared-lib';

// TODO
// Better handling of read/write of inputs as they are currently saved without ! prefix but need it for testing
// Fix naming of elements.
// Clean up constructor and functions
// Improve debug and gamestate strings for websocket

export class OSCVrChat {
  constructor(gameLogicCreator: () => OSCVrChatGameLogic) {
    this.gameLogicCreator = gameLogicCreator;
    this.gameLogic = this.gameLogicCreator();

    this.bitAllocations = JSON.parse(fs.readFileSync('configurations/user_defined_data/data.json', 'utf8'));
    this.bitAllocationConfigNames = this.bitAllocations.map((bitAllocation: BitAllocation) => bitAllocation.name);
    this.inputEventNames = JSON.parse(fs.readFileSync('configurations/user_defined_data/input.json', 'utf8'));

    this.validateBitAllocations();

    this.express = express();
    const corsOptions = {
      origin: 'http://localhost:4200',
      methods: ["GET", "POST"],
      credentials: true
    };

    this.express.use(cors(corsOptions))
    this.server = http.createServer(this.express);
    this.io = new Server(this.server, { cors: corsOptions });
    this.setupWebsocket();

    this.server.listen(3000, () => {
      console.log("Server started");
    });

    this.oscHandler = new osc.UDPPort({
      localAddress: this.url,
      localPort: this.vrChatUdpReceiverPort,
      remotePort: this.vrChatUdpSenderPort,
      metadata: false
    });

    this.oscHandler.on('message', this.onMessageRecived.bind(this));
    this.oscHandler.open();
    this.updateVrc();
  }

  public async testOnMessageRecived(address: string) {
    this.onMessageRecived({ address: address, args: [true] }, null, null);
    this.gameLogic.debugInfo();

    return new Promise(resolve => setTimeout(resolve, 251));
  }

  private positionToBits(val: number, size: number): number {
    return val & (Math.pow(2, size) - 1);
  }

  private replaceAt(string: string, index: number, replacement: string): string {
    return string.substr(0, index) + replacement + string.substr(index + replacement.length);
  }

  private piecePositionsToEightBitChunks(gameState: { [key in string]: number }): Array<{ name: EightBitChunkNames, value: number }> {
    const chunkedBits = this.getAllocatedBits('noOverflow');
    let positionBitsString: string = ''.padStart(this.getAllocatedBitsSize(chunkedBits), '0');
    let currentIndex: number = 0;

    for (const bitAllocation of chunkedBits) {
      const positionBits: string = this.positionToBits(gameState[bitAllocation.name]!, bitAllocation.size).toString(2).padStart(bitAllocation.size, '0');
      positionBitsString = this.replaceAt(positionBitsString, currentIndex, positionBits);
      currentIndex += bitAllocation.size;
    }

    const bytes: Array<{ name: EightBitChunkNames, value: number }> = [];
    currentIndex = 0;
    for (let i = 0; i < positionBitsString.length; i += 8) {
      const byteString: number = parseInt(positionBitsString.substring(i, i + 8).padEnd(8, '0'), 2);
      const name: EightBitChunkNames = Object.keys(EightBitChunkName)[currentIndex] as EightBitChunkNames;

      bytes.push({ name: name, value: byteString });
      currentIndex++;
    }

    return bytes;
  }

  private onMessageRecived(oscMsg: { address: string, args: Array<any> }, _timeTag: string | null, _info: string | null): void {
    if (!oscMsg.address.includes('!') || Date.now() - this.lastMessageDate < this.messageDelayMs || this.gamePause) {
      return;
    }

    const eventType: string | undefined = oscMsg.address.split('!')[1];

    if (eventType === undefined) {
      throw new Error(`Invalid message input ${oscMsg.address}`);
    }

    this.lastMessageDate = Date.now();

    if (this.inputEventNames.includes(eventType)) {
      if (oscMsg.args[0] === false) {
        return;
      }

      this.sendoscinput(eventType);

      const handleChessInputMessage: GameLogicResponse = this.gameLogic.handleInput(eventType);
      this.sendVrchatboxMessage(handleChessInputMessage.message);

      if (handleChessInputMessage.updateVrc) {
        return this.updateVrc();
      }
    }
    else {
      console.error(`Invalid message type: ${oscMsg.address}`);
    }
  }

  private updateVrc(): void {
    const gameState = this.gameLogic.getState();
    const missingBitAllocationConfigNames: string = this.bitAllocationConfigNames.filter((name: string) => !Object.keys(gameState).includes(name)).join(", ");

    if (missingBitAllocationConfigNames !== "") {
      throw new Error(missingBitAllocationConfigNames);
    }

    this.piecePositionsToEightBitChunks(gameState).forEach((byte) => {
      this.sendUdpMessage(`${byte.name}`, [{ type: 'i', value: byte.value }]);
    });

    this.getAllocatedBits('overflow').forEach((bitAllocation: BitAllocation) => {
      this.sendUdpMessage(`${bitAllocation.startName}`, [{ type: 'i', value: gameState[bitAllocation.name] }]);
    });

    this.getgamestate();
    this.getdebuginfo();
  }

  private sendVrchatboxMessage(message: string | null): void {
    if (message === '' || message === null || message === undefined) {
      return;
    }

    this.oscHandler.send({
      address: `/chatbox/input`,
      args: [
        {
          type: "s",
          value: message,
        },
        {
          type: "i",
          value: true
        }
      ]
    }, "127.0.0.1", 9000);
  }

  private sendUdpMessage(subAddress: string, args: Array<{ type: 'i' | 'f', value: any }>, url: string = '127.0.0.1', port: number = 9000): void {
    this.oscHandler.send({
      address: `/avatar/parameters/${subAddress}`,
      args: args
    }, url, port);
  }

  private validateBitAllocations(): void {
    const allocatedBitsSize: number = this.getAllocatedBitsSize(this.bitAllocations);

    if (allocatedBitsSize > 256) {
      throw new Error(`Too many bits allocated (limit 256): ${allocatedBitsSize}`);
    }
  }

  private getAllocatedBits(includeOverflow: 'all' | 'overflow' | 'noOverflow'): Array<BitAllocation> {
    switch (includeOverflow) {
      case 'all': return this.bitAllocations;
      case 'overflow': return this.bitAllocations.filter((bitAllocation) => bitAllocation.name.includes("Overflow"));
      case 'noOverflow': return this.bitAllocations.filter((bitAllocation) => !bitAllocation.name.includes("Overflow"));
    }
  }

  private getAllocatedBitsSize(bitAllocation: Array<BitAllocation>): number {
    return bitAllocation.reduce((accumulator: number, obj: BitAllocation) => accumulator += obj.size, 0);
  }

  private setupWebsocket(): void {
    this.io.on('connection', (socket: SocketType) => {
      console.log(`Socket connected`);
      this.connectedSocket = socket;

      socket.on(WebsocketName.server_recieve_mock_osc_input, (v) => this.mockoscinput(v));
      socket.on(WebsocketName.server_recieve_input_configuration_update, (v) => this.updateinputconfiguration(socket, v));
      socket.on(WebsocketName.server_recieve_configuration_update, (v) => this.updateconfigurations(socket, v));
      socket.on(WebsocketName.server_recieve_pause_game, (_) => this.pausegame());
      socket.on(WebsocketName.server_recieve_reset_game, (_) => this.resetgame());
      socket.on(WebsocketName.server_recieve_debug_info, (_) => this.getdebuginfo());
      socket.on(WebsocketName.server_recieve_configurations, (_) => this.getconfigurations(socket));
      socket.on(WebsocketName.server_recieve_input_configurations, (_) => this.getinputconfiguration(socket));
      socket.on(WebsocketName.server_recieve_game_state, (_) => this.getgamestate());
    });    
  }

  private getconfigurations(socket: SocketType): void {
    const configuration = JSON.parse(fs.readFileSync('configurations/auto_generated_files_internal/data_mapped.json', 'utf8'));
    socket.emit(WebsocketName.server_send_configurations, configuration);
  } 

  private getgamestate(): void {
    this.connectedSocket?.emit(WebsocketName.server_send_game_state, this.gameLogic.getState());
  } 

  private getdebuginfo(): void {
    this.connectedSocket?.emit(WebsocketName.server_send_debug_info, this.gameLogic.debugInfo());
  }

  private getinputconfiguration(socket: SocketType): void {
    const inputs = JSON.parse(fs.readFileSync('configurations/user_defined_data/input.json', 'utf8'))
    .map((input: string) => `!${input}`);
    
    socket.emit(WebsocketName.server_send_input_configurations, inputs);
  } 

  private mockoscinput(...args: any[]): void {
    this.testOnMessageRecived(args[0]);
  } 

  private sendoscinput(...args: any[]): void {
    this.connectedSocket?.emit(WebsocketName.server_send_osc_input, args[0]);
  }

  private updateconfigurations(socket: SocketType, ...args: any[]): void {
    const obj = JSON.stringify(args[0]);
    fs.writeFile('configurations/user_defined_data/input.json', obj, 'utf8');
    this.getconfigurations(socket);
  } 

  private updateinputconfiguration(socket: SocketType, ...args: any[]): void {
    const obj = JSON.stringify(args[0]);
    fs.writeFile('configurations/user_defined_data/input.json', obj, 'utf8');
    this.getinputconfiguration(socket);
  }

  private pausegame(): void {
    this.gamePause = !this.gamePause; 
  }

  private resetgame(): void {
    this.gameLogic = this.gameLogicCreator();
    this.updateVrc();
  }
  


  private lastMessageDate = Date.now() - 1000;
  private gamePause: boolean = false;
  private gameLogic: OSCVrChatGameLogic;
  private connectedSocket: SocketType | null = null;

  private readonly vrChatUdpReceiverPort: number = 9001;
  private readonly vrChatUdpSenderPort: number = 9000;
  private readonly url: string = 'localhost';
  private readonly oscHandler;
  private readonly messageDelayMs = 250;
  private readonly gameLogicCreator: () => OSCVrChatGameLogic; 
  private readonly inputEventNames: Array<string>;
  private readonly bitAllocations: Array<BitAllocation>;
  private readonly bitAllocationConfigNames: Array<string>;
  private readonly express;
  private readonly server;
  private readonly io;
}