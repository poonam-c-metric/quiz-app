/*
  Author : Poonam Gokani
  Desc   : All Function need display content and certidicate details on student home page
  Date   : 24/07/2017
 */
import { Component, OnInit } from '@angular/core';
import { ContentService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-studenthome',
  templateUrl: './studenthome.component.html',
  styleUrls: ['./studenthome.component.css']
})
export class StudenthomeComponent implements OnInit {

  private studentDetails : Object = {};
  private contentlistData : Object = {};
  private contentKeys : Array<any> =[];

  constructor(private contentService : ContentService, private toastyService : ToastyService) { }

  ngOnInit() {
  	this.studentDetails = JSON.parse(localStorage.getItem('currentStudent'));
  	this.getContentData(this.studentDetails['certificate_id']);
  }

/*
Author : Poonam Gokani
Desc   : Function to retrieve content data based on certificateid retrieve from student details
Date   : 24/07/2017
*/
  getContentData(certificateid){
	  this.contentService.getContentData(certificateid)
      .subscribe(
          data => {
            if(data['content']!=undefined){
              this.contentlistData = data['content'];
              this.contentKeys = Object.keys(this.contentlistData);
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
