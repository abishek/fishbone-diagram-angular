import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFishboneDiagramModule } from 'ngx-fishbone-diagram';
import { FormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddNodeDialogComponent } from './add-node-dialog/add-node-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    AddNodeDialogComponent
  ],
  imports: [
    BrowserModule,
    NgxFishboneDiagramModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
