
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from 'app/newRoot/app.routes';
import { AppComponent } from '@newRoot';
import {provideAnimations} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {AdminService} from "./app/services";
import {AppointmentService} from "./app/services/appointment/appointment.service";
import { WindDirectionPipe } from './app/pipes/wind-direction.pipe';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    NgModule,
    provideAnimations(),
    WindDirectionPipe,
    AdminService,
    AppointmentService // ajout pour pouvoir faire fonctionner le service pour la notification par exemple
  ]
})
  .catch(err => console.error(err));
