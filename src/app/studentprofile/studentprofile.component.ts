/*
  Author : Poonam Gokani
  Desc   : All Function required to update student profile
  Date   : 20/07/2017
*/
import { Component, OnInit } from '@angular/core';
import { StudentService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-studentprofile',
  templateUrl: './studentprofile.component.html',
  styleUrls: ['./studentprofile.component.css']
})
export class StudentprofileComponent implements OnInit {

  private studentData : any = {};

  constructor(private studentService : StudentService, private toastyService : ToastyService ) { }

  ngOnInit() {
  	this.studentData = JSON.parse(localStorage.getItem('currentStudent'));
  	console.log(this.studentData);
  }

/*
  Author : Poonam Gokani
  Desc   : Function to update student details
  Date   : 21/07/2017
*/
  updateStudent(){
    this.studentService.updateStudent(this.studentData)
        .subscribe(
          data => {
              this.toastyService.success({
                  title: "Success",
                  msg: "Student updated successfully",
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
