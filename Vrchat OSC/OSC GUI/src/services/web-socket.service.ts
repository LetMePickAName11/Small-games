import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { Configuration, InputData, WebsocketName, WebsocketNames, WebsocketWrapper, defaultWebsocketWrapper } from 'shared-lib';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public $latestDebugInfo: BehaviorSubject<WebsocketWrapper> = new BehaviorSubject<WebsocketWrapper>(defaultWebsocketWrapper("Waiting for first debug info"));
  public $latestgameState: BehaviorSubject<WebsocketWrapper> = new BehaviorSubject<WebsocketWrapper>(defaultWebsocketWrapper("Waiting for first game state"));

  public $cachedDebugInfo: BehaviorSubject<Array<WebsocketWrapper>> = new BehaviorSubject<Array<WebsocketWrapper>>([]);
  public $cachedGameState: BehaviorSubject<Array<WebsocketWrapper>> = new BehaviorSubject<Array<WebsocketWrapper>>([]);
  public $cachedOscInput: BehaviorSubject<Array<InputData>> = new BehaviorSubject<Array<InputData>>([]);
  
  public $configuration: BehaviorSubject<Array<Configuration>> = new BehaviorSubject<Array<Configuration>>([]);
  public $inputConfigurations: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  private readonly socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });
    this.setupSocketConnections();
  }

  public async sendInputConfigurationUpdate(update: Array<string>): Promise<void> {
    this.sendMessage(WebsocketName.client_send_input_configuration_update, update);
    await this.waitForMilliseconds(300);
  }

  public async sendConfigurationUpdate(update: Array<Configuration>): Promise<void> {
    this.sendMessage(WebsocketName.client_send_configuration_update, update);
    await this.waitForMilliseconds(300);
  }

  public async sendMockOSCInput(data: string): Promise<void> {
    this.sendMessage(WebsocketName.client_send_mock_osc_input, data);
    await this.waitForMilliseconds(300);
  }

  public async sendRestartGame(): Promise<void> {
    this.sendMessage(WebsocketName.client_send_reset_game, '');
    this.$latestDebugInfo.next(defaultWebsocketWrapper("Waiting for first debug info"));
    this.$latestgameState.next(defaultWebsocketWrapper("Waiting for first game state"));
    this.$cachedDebugInfo.next([]);
    this.$cachedOscInput.next([]);
    this.$cachedGameState.next([]);
    await this.waitForMilliseconds(300);
  }

  public async sendPauseGame(): Promise<void> {
    this.sendMessage(WebsocketName.client_send_pause_game, '');
    await this.waitForMilliseconds(300);
  }

  private setupSocketConnections(): void {
    this.socket.on('connect', () => {
      console.log("Connected with socket ID:", this.socket.id);
      this.fetchDataFromSocket();
    });

    this.socket.on('disconnect', () => {
      console.log("Disconnected, socket ID was:", this.socket.id);
    });

    this.socket.on(WebsocketName.client_recieve_game_state, (message: string) => {
      console.log("Received client_recieve_game_state:", message);
      const prevVal: Array<WebsocketWrapper> = this.$cachedGameState.value;
      const packedInfo: WebsocketWrapper = { value: message, timestamp: new Date(), count: prevVal.length + 1 };
      prevVal.push(packedInfo);

      this.$cachedGameState.next(prevVal);
      this.$latestgameState.next(packedInfo);
    });

    this.socket.on(WebsocketName.client_recieve_debug_info, (message: string) => {
      console.log("Received client_recieve_debug_info:", message);
      const prevVal: Array<WebsocketWrapper> = this.$cachedDebugInfo.value;
      const packedInfo: WebsocketWrapper = { value: message, timestamp: new Date(), count: prevVal.length + 1 };
      prevVal.push(packedInfo);

      this.$cachedDebugInfo.next(prevVal);
      this.$latestDebugInfo.next(packedInfo);
    });

    this.socket.on(WebsocketName.client_recieve_osc_input, (message: string) => {
      console.log("Received client_recieve_osc_input:", message);
      const prevVal = this.$cachedOscInput.value;
      const packedInfo: InputData = { value: message, timestamp: new Date(), id: Date.now() };

      this.$cachedOscInput.next([packedInfo, ...prevVal]);
    });

    this.socket.on(WebsocketName.client_recieve_configurations, (message: Array<Configuration>) => {
      console.log("Received client_recieve_configurations:", message);
      this.$configuration.next(message);
    });

    this.socket.on(WebsocketName.client_recieve_input_configurations, (message: Array<string>) => {
      console.log("Received client_recieve_input_configurations:", message);
      this.$inputConfigurations.next(message);
    });
  }

  private fetchDataFromSocket(): void {
    this.sendMessage(WebsocketName.client_request_configurations, '');
    this.sendMessage(WebsocketName.client_request_debug_info, '');
    this.sendMessage(WebsocketName.client_request_game_state, '');
    this.sendMessage(WebsocketName.client_request_input_configurations, '');
  }

  private sendMessage(name: WebsocketNames, message: string | object): void {
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
