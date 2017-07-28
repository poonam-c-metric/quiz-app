/*
  Author : Poonam Gokani
  Desc   : All Function need to implement publish certificate functionality
  Date   : 28/07/2017
 */

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.css']
})

export class PublishComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  certificatePublish(){
  	console.log('Publish Certificate');
  }

}
