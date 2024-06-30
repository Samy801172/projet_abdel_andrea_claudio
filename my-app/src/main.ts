import { bootstrapApplication } from '@angular/platform-browser';
<<<<<<< HEAD
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from 'app/newRoot/app.routes';
import { AppComponent } from '@newRoot';
=======
;
import { HttpClientModule } from '@angular/common/http';
import {AppComponent, appConfig} from '@newRoot';

bootstrapApplication(AppComponent, {
  providers: [HttpClientModule, ...appConfig.providers]
})
  .catch(err => console.error(err));

>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
})
  .catch(err => console.error(err));
