import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mainmenu',
  templateUrl: './mainmenu.component.html',
  styleUrls: ['./mainmenu.component.css']
})
export class MainmenuComponent implements OnInit {

  public certificateID ;
  constructor(private route: ActivatedRoute) {
  	this.certificateID = route.snapshot.params['certificate_id'];
  }

  ngOnInit() {

  }

}
