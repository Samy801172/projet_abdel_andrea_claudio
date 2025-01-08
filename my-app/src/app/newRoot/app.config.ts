// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {authInterceptor} from '../services/auth/auth.interceptor';
import {TimerService} from '../services/timer/timer.service';


export const appConfig: ApplicationConfig = {
  providers: [ TimerService,
    provideRouter(routes), provideHttpClient(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
