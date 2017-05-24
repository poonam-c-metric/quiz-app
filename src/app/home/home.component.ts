import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CertificateService } from '../_services/index';
import { User } from '../_models/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser : User;
  certificateData : Object;

  constructor(private certificateService : CertificateService , private router : Router) {
  	this.currentUser = JSON.parse(localStorage.getItem('currentUser'))[0];
  }

  ngOnInit() {
  	this.getCertificateData()
  }

  getCertificateData(){
	  this.certificateService.getCertificateData(this.currentUser.member_id)
            .subscribe(
                data => {
                    this.certificateData = data['certificate'];
                    console.log(this.certificateData);
                },
                error => {
                   console.log(error);
                });
    }

    changeURL(){
      this.router.navigate(['/certificate']);
    }

}