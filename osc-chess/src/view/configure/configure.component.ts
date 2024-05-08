import { Component } from '@angular/core';
import { NavbarComponent } from '../../core/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { NavbarRouteLink } from '../../models/navbarRouteLink';

@Component({
  selector: 'app-configure',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './configure.component.html',
  styleUrl: './configure.component.scss'
})
export class ConfigureComponent {
  public readonly navbarRoutes: Array<NavbarRouteLink> = [
    {
      path: 'configuration',
      text: 'Configurations'
    },
    {
      path: 'inputs',
      text: 'Inputs'
    }
  ];
}