import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription, filter, tap } from 'rxjs';
import { InputData } from '../../models/inputData';
import { WebsocketWrapper } from '../../models/debugInfo';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, color: 'black' }),
        animate('500ms', style({ opacity: 1, color: 'red' })),
        animate('2000ms', style({ color: 'black' }))
      ])
    ])
  ]
})
export class DebugComponent implements OnInit, OnDestroy {
  // Data properties
  public oscInputs: Array<InputData> = [];
  public debugInfo: WebsocketWrapper = {
    value: 'Wating for first game state...',
    timestamp: new Date(),
    count: 0,
  };
  public gameState: WebsocketWrapper = {
    value: 'Wating for first game state...',
    timestamp: new Date(),
    count: 0,
  };
  public inputConfigurations: Array<string> = [];

  // UI properties
  public disableInputButtons: boolean = false;
  public disableResetStateButton: boolean = false;
  public disablePauseStateButton: boolean = false;

  private subscriptions: Array<Subscription> = [];

  constructor(private websocketService: WebSocketService) { }

  public ngOnInit(): void {
    this.setupSubscribers();
    this.getWebsocketData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => sub?.unsubscribe());
  }

  // Button functions
  public async sendInputClick(input: string): Promise<void> {
    if (this.disableInputButtons) {
      return;
    }

    this.disableInputButtons = true;
    await this.websocketService.sendMockOSCInput(input);
    this.disableInputButtons = false;
  }

  public async sendPauseGameClick(): Promise<void> {
    if (this.disablePauseStateButton) {
      return;
    }

    this.disablePauseStateButton = true;
    await this.websocketService.sendPauseGame();
    this.disablePauseStateButton = false;
  }

  public async sendResetGameClick(): Promise<void> {
    if (this.disableResetStateButton) {
      return;
    }

    this.disableResetStateButton = true;
    await this.websocketService.sendRestartGame();
    this.disableResetStateButton = false;
  }

  // Ngfor pipe function
  public trackByFunction(_: number, value: InputData): number {
    return value.id;
  }


  private getWebsocketData(): void {
    this.inputConfigurations = this.websocketService.$inputConfigurations.value;
    this.oscInputs = this.websocketService.$cachedOscInput.value;

    const cachedDebugInfo: Array<WebsocketWrapper> = this.websocketService.$cachedDebugInfo.value;
    const cachedGameStates: Array<WebsocketWrapper> = this.websocketService.$cachedGameState.value;

    if (cachedGameStates.length !== 0) {
      this.debugInfo = cachedGameStates[cachedGameStates.length - 1];
    }
    if (cachedDebugInfo.length !== 0) {
      this.debugInfo = cachedDebugInfo[cachedDebugInfo.length - 1];
    }
  }

  private setupSubscribers(): void {
    const sub1: Subscription = this.websocketService.$latestgameState.pipe(
      filter((gameState: WebsocketWrapper | null) => gameState !== null),
      tap((gameState: WebsocketWrapper | null) => this.gameState = gameState!))
      .subscribe();

    const sub2: Subscription = this.websocketService.$latestOscInput.pipe(
      filter((input: InputData | null) => input !== null),
      tap((input: InputData | null) => this.oscInputs = [input!, ...this.oscInputs]))
      .subscribe();

    const sub3: Subscription = this.websocketService.$latestDebugInfo.pipe(
      filter((debugInfo: WebsocketWrapper | null) => debugInfo !== null),
      tap((debugInfo: WebsocketWrapper | null) => this.debugInfo = debugInfo!))
      .subscribe();

    this.subscriptions.push(sub1);
    this.subscriptions.push(sub2);
    this.subscriptions.push(sub3);
  }
}
