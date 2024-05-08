import { Routes } from '@angular/router';
import { DebugComponent } from '../view/debug/debug.component';
import { ConfigureComponent } from '../view/configure/configure.component';
import { configurationChildren } from '../view/configure/configure.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'debug',
    pathMatch: 'full'
  },
  {
    path: 'debug',
    component: DebugComponent
  },
  {
    path: 'configure',
    component: ConfigureComponent,
    children: configurationChildren
  }
];
