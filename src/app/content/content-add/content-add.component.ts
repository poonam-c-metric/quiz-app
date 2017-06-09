import { Component, OnInit } from '@angular/core';
import { Content } from '../../_models/index';

@Component({
  selector: 'app-content-add',
  templateUrl: './content-add.component.html',
  styleUrls: ['./content-add.component.css']
})
export class ContentAddComponent implements OnInit {
  content : any = {};
  constructor() { }
  ngOnInit() {
  }
}
