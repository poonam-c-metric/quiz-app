import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CertificateService } from '../_services/index';
import { User } from '../_models/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser : User;
  certificateData : Object;
  certificateID : String;

  constructor(private certificateService : CertificateService , private router : Router , private toastyService:ToastyService) {
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

    openDeleteCertificateModal(certid,dcmodal){
      dcmodal.open();
      this.certificateID = certid;
    }

    deleteCertificate(certificateid,dcmodal){
      this.certificateService.deleteCertificateById(certificateid)
        .subscribe(data => {
            dcmodal.close();
            this.toastyService.success({
              title: data.code,
              msg: data.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
            this.getCertificateData();
          },error => {
            dcmodal.close();
            this.toastyService.error({
              title: error.code,
              msg: error.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
          });
    }
}