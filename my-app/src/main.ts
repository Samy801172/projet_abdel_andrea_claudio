
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from 'app/newRoot/app.routes';
import { AppComponent } from '@newRoot';
import {provideAnimations} from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
})
  .catch(err => console.error(err));
