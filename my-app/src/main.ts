import { bootstrapApplication } from '@angular/platform-browser';
;
import { HttpClientModule } from '@angular/common/http';
import {AppComponent, appConfig} from '@newRoot';

bootstrapApplication(AppComponent, {
  providers: [HttpClientModule, ...appConfig.providers]
})
  .catch(err => console.error(err));



