import { Component, OnInit } from '@angular/core';
import { Certificate } from '../_models/index';
import { CertificateService } from '../_services/index'
import {ToastyService, ToastyConfig} from 'ng2-toasty';
import {ActivatedRoute} from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { FileLikeObject } from 'ng2-file-upload';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {

  //certificateData : Certificate = {};
  certificateData : any = {};
  certificateID : String;
  public errorMessage : String;
  public ecommerce : number;
  public showAdvancedFlag : boolean = false;
  public uploader : FileUploader = new FileUploader({url:'http://localhost:3000/api/upload', autoUpload: true , allowedMimeType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif' , 'image/svg+xml'],
   maxFileSize: 10*1024*1024});

  constructor(private certificateService : CertificateService , private toastyService : ToastyService , private route: ActivatedRoute)  {
    this.certificateID = route.snapshot.params['certificate_id'];
    if(typeof this.certificateID != 'undefined'){
      this.getCertificateById(this.certificateID)
    }
  }

  ngOnInit() {
    this.uploader.onWhenAddingFileFailed = (item, filter, options) => this.onWhenAddingFileFailed(item, filter, options);

    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
      let res = JSON.parse(response);
      this.certificateData.certificate_logo = res.filename;
    };
  }

  getCertificateById(certid){
     this.certificateService.getCertificateById(certid)
      .subscribe(
        data => {
            this.certificateData = data['certificate'][0];
            if(this.certificateData['cert_cost']!==0){
              this.ecommerce = 1;
            }
        },
        error => {
            let err = error.json();
        });
  }

  createCertificate(){
    if(this.certificateID!='' && this.certificateID!=undefined){
      this.certificateData['id_edited'] = JSON.parse(localStorage.getItem('currentUser'))[0].member_id;
      this.certificateData['is_active'] = 0;
      this.certificateService.updateCertificate(this.certificateData)
        .subscribe(
          data => {
              this.toastyService.success({
                  title: "Success",
                  msg: "Certificate updated successfully",
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
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
    }else{
      this.certificateData['id_added'] = JSON.parse(localStorage.getItem('currentUser'))[0].member_id;
      this.certificateData['is_active'] = 0;
      console.log(this.certificateData);
      this.certificateService.createCertificate(this.certificateData)
        .subscribe(
          data => {
              this.toastyService.success({
                  title: "Success",
                  msg: "Certificate created successfully",
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
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
  }

  showAdvancedSetting(){
    this.showAdvancedFlag = !this.showAdvancedFlag;
  }

  changeCertCost(newValue){
    console.log('Inside changeCertCost'+ newValue);
    if(this.ecommerce){
      this.certificateData.cert_cost = 0;
    }
  }

  onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any) {
      switch (filter.name) {
        case 'fileSize':
            this.errorMessage = `Maximum upload size exceeded (${item.size} of ${this.uploader.options.maxFileSize} allowed)`;
            console.log(this.errorMessage);
            break;
        case 'mimeType':
            const allowedTypes = this.uploader.options.allowedMimeType.join();
            this.errorMessage = `Type "${item.type} is not allowed. Allowed types: "${allowedTypes}"`;
            console.log(this.errorMessage);
            break;
        default:
            this.errorMessage = `Unknown error (filter is ${filter.name})`;
            console.log(this.errorMessage);
      }
    }
}