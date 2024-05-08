import { Routes } from '@angular/router';
import { ConfigureInputComponent } from './configure-input/configure-input.component';
import { ConfigureConfigurationComponent } from './configure-configuration/configure-configuration.component';

export const configurationChildren: Routes = [
  {
    path: '',
    redirectTo: 'configuration',
    pathMatch: 'full'
  },
  {
    path: 'configuration',
    component: ConfigureConfigurationComponent
  },
  {
    path: 'inputs',
    component: ConfigureInputComponent
  }
];
