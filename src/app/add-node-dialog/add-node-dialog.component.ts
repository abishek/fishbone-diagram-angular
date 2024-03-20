import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-node-dialog',
  templateUrl: './add-node-dialog.component.html',
  styleUrls: ['./add-node-dialog.component.css'],
})
export class AddNodeDialogComponent implements OnInit {

  data: any;
  nodeName = '';

  constructor(
    private dialogRef: MatDialogRef<AddNodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: any
  ) { 
    this.data = dialogData;
  }

  ngOnInit(): void {
    // we don't have a need for this yet.
    // console.log(this.data);
    console.log('dialog init');
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({nodeName: this.nodeName});
  }

}
