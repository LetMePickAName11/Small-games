import { Routes } from '@angular/router';
import { DebugComponent } from '../view/debug/debug.component';
import { ConfigureComponent } from '../view/configure/configure.component';
import { TestComponent } from '../view/test/test.component';

export const routes: Routes = [
  {
    path: 'debug',
    component: DebugComponent
  },
  {
    path: 'configure',
    component: ConfigureComponent
  },
  {
    path: 'test',
    component: TestComponent
  }
];
