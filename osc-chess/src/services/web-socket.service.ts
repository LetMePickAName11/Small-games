import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Configuration } from '../models/configuration';
import { Socket, io } from 'socket.io-client';
import { WebSockNamesIn, WebSockNamesOut } from '../models/websocket';
import { InputData } from '../models/inputData';
import { DebugInfo } from '../models/debugInfo';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public configurationUpdates: BehaviorSubject<Array<Configuration>> = new BehaviorSubject<Array<Configuration>>([]);
  public inputConfiguration: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  public latestGameStateUpdate: BehaviorSubject<DebugInfo | null> = new BehaviorSubject<DebugInfo | null>(null);
  public latestInputUpdate: BehaviorSubject<InputData | null> = new BehaviorSubject<InputData | null>(null);

  public allGameStateUpdates: BehaviorSubject<Array<DebugInfo>> = new BehaviorSubject<Array<DebugInfo>>([]);
  public allInputUpdates: BehaviorSubject<Array<InputData>> = new BehaviorSubject<Array<InputData>>([]);

  private readonly socket: Socket;
  private readonly url: string = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.url);
    this.setupSocketConnections();
    this.fetchDataFromSocket();
  }

  public async updateInputs(update: Array<string>): Promise<void> {
    this.sendMessage(WebSockNamesOut.updateinputs, update);
    await this.waitForMilliseconds(300);
  }

  public async updateConfigurations(update: Array<Configuration>): Promise<void> {
    this.sendMessage(WebSockNamesOut.updateinputs, update);
    await this.waitForMilliseconds(300);
  }

  public async mockInput(data: string): Promise<void> {
    this.sendMessage(WebSockNamesOut.mockinput, data);
    await this.waitForMilliseconds(300);
  }

  public async resetGameState(): Promise<void> {
    this.sendMessage(WebSockNamesOut.resetgame, '');
    await this.waitForMilliseconds(300);
  }

  public async pauseGame(): Promise<void> {
    this.sendMessage(WebSockNamesOut.pausegame, '');
    await this.waitForMilliseconds(300);
  }

  private setupSocketConnections(): void {
    this.socket.on('connect', () => {
      console.log("Connected with socket ID:", this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log("Disconnected, socket ID was:", this.socket.id);
    });

    this.socket.on(WebSockNamesIn.gamestateupdated, (message: string) => {
      console.log("Received gamestateupdated:", message);
      const prevVal: Array<DebugInfo> = this.allGameStateUpdates.value;
      const packedInfo: DebugInfo = { value: message, timestamp: new Date(), count: prevVal.length };
      prevVal.push(packedInfo);

      this.allGameStateUpdates.next(prevVal);
      this.latestGameStateUpdate.next(packedInfo);
    });

    this.socket.on(WebSockNamesIn.inputupdated, (message: string) => {
      console.log("Received inputupdated:", message);

      const prevVal = this.allInputUpdates.value;
      const packedInfo: InputData = { value: message, timestamp: new Date(), id: Date.now() };
      prevVal.push(packedInfo);

      this.allInputUpdates.next(prevVal);
      this.latestInputUpdate.next(packedInfo);
    });

    this.socket.on(WebSockNamesIn.configurationupdated, (message: Array<Configuration>) => {
      console.log("Received configurationupdated:", message);
      this.configurationUpdates.next(message);
    });
  }

  private fetchDataFromSocket(): void {
    this.sendMessage(WebSockNamesOut.getconfigurations, '');
    this.sendMessage(WebSockNamesOut.getgamestate, '');
    this.sendMessage(WebSockNamesOut.getinputs, '');
  }

  private sendMessage(name: WebSockNamesOut, message: string | object): void {
    this.socket.emit(name, message);
  }

  private waitForMilliseconds(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
