/*
  Author : Poonam Gokani
  Desc   : All Function need to implement publish certificate functionality
  Date   : 28/07/2017
 */

import { Component, OnInit } from '@angular/core';
import { PublishService , CertificateService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.css']
})

export class PublishComponent implements OnInit {

  private certificateId : string ;
  private resourceCount : number ;
  private questionCount : number ;
  private questionFlag : boolean = false;
  private certificatePublishFlag : number = 0;

  constructor(private publishService : PublishService, private toastyService : ToastyService, private certificateService : CertificateService) { }

  ngOnInit() {
    this.certificateId = localStorage.getItem('certificate_id');
    this.getCertificateById(this.certificateId);
  }

/*
  Author : Poonam Gokani
  Desc   : Function used to check current certificate has resource or not
  Date   : 31/07/2017
*/
  hasResource(){
    this.publishService.hasResource(this.certificateId)
      .subscribe(
        data => {
          this.resourceCount = data['contentCount'];
        },
        error => {
            let err = error.json();
        });
  }

/*
  Author : Poonam Gokani
  Desc   : Function used to check certificate contains any question or not
  Date   : 01/08/2017
*/
  hasQuestionData(){
    this.publishService.hasQuestionData(this.certificateId)
      .subscribe(
        data => {
          this.questionFlag = data['hasQuestionFlag'];
        },
        error => {
            let err = error.json();
        });
  }

/*
  Author : Poonam Gokani
  Desc   : Function used to publish certificate
  Date   : 02/08/2017
*/
  publishCertificate(){
    var certdata = {
      'certificate_id' : localStorage.getItem('certificate_id'),
      'member_id' : JSON.parse(localStorage.getItem('currentUser')).member_id,
      'step_one' : 1,
      'step_two' : 1,
      'is_active' : 1
    };
    this.publishService.publishCertificate(certdata)
      .subscribe(
        data => {
          console.log(data);
          if(data.status == 1){
            this.certificatePublishFlag = 1;
            this.toastyService.success({
              title: data.code,
              msg: data.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
          }else{
            this.toastyService.warning({
              title: data.code,
              msg: data.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
          }
        },
        error => {
            let err = error.json();
        });
  }

/*
  Author : Poonam Gokani
  Desc   : Function used to get certificate details by its id
  Date   : 02/08/2017
*/
  getCertificateById(certid){
     this.certificateService.getCertificateById(certid)
      .subscribe(
        data => {
          this.certificatePublishFlag = data['certificate'][0]['is_active'];
          if(this.certificatePublishFlag == 0){
            this.hasResource();
            this.hasQuestionData();
          }
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
  Desc   : Function used to unpublish certificate
  Date   : 02/08/2017
*/
  unpublishCertificate(){
    var certdata = {
      'certificate_id' : localStorage.getItem('certificate_id'),
      'is_active' : 0
    };
    this.publishService.unpublishCertificate(certdata)
      .subscribe(
        data => {
          console.log(data);
          if(data.status == 1){
            this.certificatePublishFlag = 0;
            this.toastyService.success({
              title: data.code,
              msg: data.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
          }else{
            this.toastyService.warning({
              title: data.code,
              msg: data.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
          }
        },
        error => {
            let err = error.json();
        });
  }
}