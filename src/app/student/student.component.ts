import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../_services/index';
import { User } from '../_models/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})

export class StudentComponent implements OnInit {

  currentUser : User;
  studentDeleteID : String;
  studentlistData : Object;
  public filterQuery = "";
  public rowsOnPage = 10;
  public sortBy = "email";
  public sortOrder = "asc";

  constructor(private router : Router,private toastyService : ToastyService ,private studentService : StudentService,
    private route: ActivatedRoute){
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.getStudentData(localStorage.getItem('certificate_id'));
  }

  openDeleteStudentModal(studid,dsmodal){
    dsmodal.open();
    this.studentDeleteID = studid;
  }

  //Delete student
  deleteStudent(stuid,dsmodal){
     this.studentService.deleteStudent(stuid)
      .subscribe(
        data => {
          dsmodal.close();
          this.toastyService.success({
              title: "Success",
              msg: "Student deleted successfully",
              showClose: true,
              timeout: 5000,
              theme: "material"
          });
          this.getStudentData(localStorage.getItem('certificate_id'));
          this.router.navigate(['/students']);
        },
        error => {
            let err = error.json();
        });
  }

  getStudentData(certificateid){
	  this.studentService.getStudentData(certificateid)
      .subscribe(
          data => {
            if(data['student']!=undefined){
              this.studentlistData = data['student'];
            }else{
              this.studentlistData = [];
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

  changeURL(){
      this.router.navigate(['/students/add']);
  }
}
