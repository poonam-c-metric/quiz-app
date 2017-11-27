/*
  Author : Poonam Gokani
  Desc   : All Function required to render student dashboard
  Date   : 20/07/2017
*/
import { Component, OnInit } from '@angular/core';
import { ContentService,CertificateService,StudentModuleService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-studentdashboard',
  templateUrl: './studentdashboard.component.html',
  styleUrls: ['./studentdashboard.component.css']
})

export class StudentdashboardComponent implements OnInit {

  private studentDetails : Object = {};
  private certificateData : Object = {};

  constructor(private contentService : ContentService, private toastyService : ToastyService, private certificateService : CertificateService, private studentModuleService : StudentModuleService, private router:Router) { }

  ngOnInit() {
  	this.studentDetails = JSON.parse(localStorage.getItem('currentStudent'));
    this.getCertificateById(this.studentDetails['certificate_id']);
  }

/*
Author : Poonam Gokani
Desc   : Function to retrieve certificate details based on certificateid retrieve from student details
Date   : 20/07/2017
*/
  getCertificateById(certid){
     this.certificateService.getCertificateById(certid)
      .subscribe(
        data => {
          this.certificateData = data['certificate'][0];
        },
        error => {
          let err = error.json();
          this.toastyService.error({
            title: err.code,
            msg: err.message,
            showClose: true,
            timeout: 5000,
            theme: "material"
          });
        });
  }

/*
Author : Poonam Gokani
Desc   : Function to perform logout
Date   : 21/07/2017
*/
  logoutStudent(){
    this.studentModuleService.logout()
      .subscribe(
          data => {
            localStorage.removeItem('studentAccessToken');
            localStorage.removeItem('currentStudent');
            this.router.navigate(['/online-exam']);
          });
  }
}