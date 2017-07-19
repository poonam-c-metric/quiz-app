/*
  Author : Poonam Gokani
  Desc   : Component Function to generate UI of preview test
  Date   : 11/07/2017
 */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ContentService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})

export class PreviewComponent implements OnInit {

  private certificateId : string;
  private contentlistData : Object;

  constructor(private toastyService : ToastyService , private contentService : ContentService) {
  	this.certificateId = localStorage.getItem('certificate_id');
  	this.getContentData(this.certificateId)
  }

  ngOnInit() {

  }

/*
  Author : Poonam Gokani
  Desc   : Function to retrieve content data based on certificate id passed
  Date   : 11/07/2017
 */
  getContentData(certificateid){
	  this.contentService.getContentData(certificateid)
      .subscribe(
          data => {
            if(data['content']!=undefined){
              this.contentlistData = data['content'];
              console.log(this.contentlistData);
            }else{
              this.contentlistData = [];
              this.toastyService.error({
                title: data.code,
                msg: data.message,
                showClose: true,
                timeout: 5000,
                theme: "material"
              });
            }
        });
  }

}
