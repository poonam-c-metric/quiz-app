/*
  Author : Poonam Gokani
  Desc   : All Function need display content and certidicate details on student home page
  Date   : 24/07/2017
 */
import { Component, OnInit } from '@angular/core';
import { StudentModuleService } from '../_services/index';
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

  constructor(private toastyService : ToastyService, private studentModuleService : StudentModuleService) { }

  ngOnInit() {
  	this.studentDetails = JSON.parse(localStorage.getItem('currentStudent'));
  	this.getContentForStudent(this.studentDetails['certificate_id'],this.studentDetails['student_id']);
  }

/*
Author : Poonam Gokani
Desc   : Function to retrieve content data based on certificateid retrieve from student details
Date   : 10/08/2017
*/
  getContentForStudent(certificateid,studentid){
	  this.studentModuleService.getContentForStudent(certificateid,studentid)
      .subscribe(
          data => {
            if(data['content']!=undefined){
              this.contentlistData = data['content'];
              console.log('Inside Content Data');
              console.log(this.contentlistData);
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
