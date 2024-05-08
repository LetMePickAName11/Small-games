import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../core/navbar/navbar.component';
import { WebSocketService } from '../services/web-socket.service';
import { NavbarRouteLink } from '../models/navbarRouteLink';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  public readonly navbarRoutes: Array<NavbarRouteLink> = [
    {
      path: 'debug',
      text: 'Debug'
    },
    {
      path: 'configure',
      text: 'Configure'
    }
  ];

  constructor(webSocketService: WebSocketService) { }
}
