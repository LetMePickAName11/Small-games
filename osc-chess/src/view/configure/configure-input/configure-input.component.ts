import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { WebSocketService } from '../../../services/web-socket.service';
import { Subscription, tap } from 'rxjs';
@Component({
  selector: 'app-configure-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './configure-input.component.html',
  styleUrl: './configure-input.component.scss',
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
export class ConfigureInputComponent {

  public numSi: Array<string> = [];
  public savingButtonDisabled: boolean = false;
  
  private _prefix: string = "!";
  private _myNumber: number = 0;
  private subscriptions: Array<Subscription> = [];

  constructor(private webSocketService: WebSocketService){
    this.subscriptions.push(
      webSocketService.$inputConfigurations.pipe(tap(a => {
        a = a ?? [];
        this._myNumber = a.length;
        this._prefix = `!${a[0]}`;
      })).subscribe(),
    );
  }

  get prefix(): string {
    return this._prefix;
  }

  set prefix(value: string) {
    if(value === null || value === undefined || value.length === 0 || value[0] !== '!'){
      value = `!${value}`;
    }
    this._prefix = value;
    this.numSi = Array(this._myNumber).fill('!' + this._prefix + '_').map((v, i) => v + i);
  }

  get myNumber(): number {
    return this._myNumber;
  }

  set myNumber(value: number) {
    if (value >= 0 && value <= 256) {
      this._myNumber = value;
    }
    else {
      this._myNumber = 0;
    }
    this.numSi = Array(this._myNumber).fill('!' + this._prefix + '_').map((v, i) => v + i);
  }

  public async saveChanges(): Promise<void> {
    if (this.savingButtonDisabled) {
      return;
    }
    this.savingButtonDisabled = true;

    this.savingButtonDisabled = false;
  }

  public trackByFunction(_: number, value: string): string {
    return value;
  }
}
