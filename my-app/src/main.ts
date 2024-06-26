
import { bootstrapApplication } from '@angular/platform-browser';
import {AppComponent, appConfig} from '@newRoot';


bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));


