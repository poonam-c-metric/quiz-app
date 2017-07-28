/*
  Author : Poonam Gokani
  Desc   : Component - Contain All Function required to update student dashboard
  Date   : 24/07/2017
*/
import { Component, OnInit } from '@angular/core';
import { StudentModuleService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-studentpassword',
  templateUrl: './studentpassword.component.html',
  styleUrls: ['./studentpassword.component.css']
})
export class StudentpasswordComponent implements OnInit {

  private changepwddata : Object = {};
  constructor(private studentModuleService : StudentModuleService , private toastyService : ToastyService ) { }

  ngOnInit() {
  }

  /*
   Author : Poonam Gokani
   Desc   : Function to integrate angular webservice updatePassword
   Date   : 24/07/2017
  */
  updatePassword(changepwddata){
  	changepwddata['student_id'] = JSON.parse(localStorage.getItem('currentStudent')).student_id;
	  this.studentModuleService.updatePassword(changepwddata)
        .subscribe(
            data => {
            	if(data.status=="1"){
	                this.toastyService.success({
	                    title: data.code,
	                    msg: data.message,
	                    showClose: true,
	                    timeout: 5000,
	                    theme: "material"
	                });
	            }else{
	            	let err = data;
	                this.toastyService.error({
	                    title: err.code,
	                    msg: err.message,
	                    showClose: true,
	                    timeout: 5000,
	                    theme: "material"
	                });
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

}
