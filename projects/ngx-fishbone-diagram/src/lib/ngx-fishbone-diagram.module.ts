import { NgModule } from '@angular/core';
import { NgxFishboneDiagramService } from './ngx-fishbone-diagram.service';
import { NgxFishboneDiagramComponent } from './ngx-fishbone-diagram.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NgxFishboneDiagramComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgxFishboneDiagramComponent
  ],
  providers:[
    NgxFishboneDiagramService
  ]
})
export class NgxFishboneDiagramModule { }
