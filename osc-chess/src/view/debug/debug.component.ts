import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription, filter, tap } from 'rxjs';
import { InputData } from '../../models/inputData';
import { DebugInfo } from '../../models/debugInfo';

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
  public inputs: Array<InputData> = [];
  public debugInfo: DebugInfo = {
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
    await this.websocketService.mockInput(input);
    this.disableInputButtons = false;
  }

  public async sendPauseGameClick(): Promise<void> {
    if (this.disablePauseStateButton) {
      return;
    }

    this.disablePauseStateButton = true;
    await this.websocketService.pauseGame();
    this.disablePauseStateButton = false;
  }

  public async sendResetGameClick(): Promise<void> {
    if (this.disableResetStateButton) {
      return;
    }

    this.disableResetStateButton = true;
    await this.websocketService.resetGameState();
    this.disableResetStateButton = false;
  }

  // Ngfor pipe function
  public trackByFunction(_: number, value: InputData): number {
    return value.id;
  }


  private getWebsocketData(): void {
    this.inputConfigurations = this.websocketService.inputConfiguration.value;
    this.inputs = this.websocketService.allInputUpdates.value;

    const cachedGameStates: Array<DebugInfo> = this.websocketService.allGameStateUpdates.value;
    if (cachedGameStates.length === 0) {
      return;
    }

    this.debugInfo = cachedGameStates[cachedGameStates.length - 1];
  }

  private setupSubscribers(): void {
    const sub1: Subscription = this.websocketService.latestGameStateUpdate.pipe(
      filter((gameState: DebugInfo | null) => gameState !== null),
      tap((gameState: DebugInfo | null) => this.debugInfo = gameState!))
      .subscribe();

    const sub2: Subscription = this.websocketService.latestInputUpdate.pipe(
      filter((input: InputData | null) => input !== null),
      tap((input: InputData | null) => this.inputs = [input!, ...this.inputs]))
      .subscribe();

    this.subscriptions.push(sub1);
    this.subscriptions.push(sub2);
  }
}
