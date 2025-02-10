import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
// @ts-ignore
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from '@newRoot';
import { ManufacturingModule } from './manufacturing/manufacturing.module';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ManufacturingModule,
    AppRoutingModule,
    AppComponent
  ],
  providers: [],

})
export class AppModule { }
