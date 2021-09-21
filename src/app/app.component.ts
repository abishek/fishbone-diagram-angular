import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as uuid from 'uuid';

import { AddNodeDialogComponent } from './add-node-dialog/add-node-dialog.component';
import { testData } from './test.data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private dialog: MatDialog
  ) { }

  data = testData;
  // data: any = undefined;

  onNodeSelect(evt: string) {
    const parentNode = this.findNodeById(this.data, evt);
    const dialog = this.dialog.open(AddNodeDialogComponent, {width: '300px', data: parentNode});
    console.log({parentNode});
    dialog.afterClosed().subscribe((res) => {
      if(res) {
        const newNode = {
          uuid: uuid.v4(),
          name: res,
        };
        if(parentNode.children) {
          parentNode.children.push(newNode);
        } else {
          parentNode.children = [newNode];
        }
        this.data = {...this.data};
      }
    });
  }

  findNodeById(node: any, id: string): any {
    if (node.uuid === id) {
      return node;
    }
    let resultNode;
    if (node.children && node.children.length > 0) {
      for(let idx=0; idx < node.children.length; idx += 1) {
        resultNode = this.findNodeById(node.children[idx], id);
        if(resultNode) {
          break;
        }
      }
    }
    return resultNode;
  }
}
