import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent {

  helpText = 'Click on a node to add child nodes. Build as deep as you need to get to your root causes. Once done, click on the `Download PNG` button to save a copy of the diagram locally.';

}
