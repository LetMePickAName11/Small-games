import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { Configuration } from '../../models/configuration';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.scss'
})
export class DebugComponent  {




  public myButtonClick() {
    console.log("Yo");
  }
}
