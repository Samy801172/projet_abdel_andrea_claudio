import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@newRoot';
import { AppComponent } from '@newRoot';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

