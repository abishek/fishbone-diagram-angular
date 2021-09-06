import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFishboneDiagramModule } from 'ngx-fishbone-diagram';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxFishboneDiagramModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
