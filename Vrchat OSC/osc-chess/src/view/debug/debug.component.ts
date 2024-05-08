import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription, tap } from 'rxjs';
import { InputData, WebsocketWrapper, defaultWebsocketWrapper } from 'shared-lib';

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
  public debugInfo: WebsocketWrapper = defaultWebsocketWrapper("Waiting for first debug info");
  public gameState: WebsocketWrapper = defaultWebsocketWrapper("Waiting for first game state");

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
    this.subscriptions.push(
      this.websocketService.$latestgameState.pipe(
        tap((gameState: WebsocketWrapper) => this.gameState = gameState)
      ).subscribe(),
  
      this.websocketService.$latestDebugInfo.pipe(
        tap((debugInfo: WebsocketWrapper) => this.debugInfo = debugInfo)
      ).subscribe(),

      this.websocketService.$cachedOscInput.pipe(
        tap((oscInputs: Array<InputData>) => this.oscInputs = oscInputs)
      ).subscribe(),
  
      this.websocketService.$inputConfigurations.pipe(
        tap((inputConfigurations: Array<string>) => this.inputConfigurations = inputConfigurations)
      ).subscribe(),
    );
  }
}
