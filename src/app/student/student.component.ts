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
  constructor(
  private router : Router,
  private toastyService : ToastyService ,
  private studentService : StudentService,
  private route: ActivatedRoute
  ) {
  this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
  this.studentDeleteID = route.snapshot.params['student_del_id'];
     
    if(typeof this.studentDeleteID != 'undefined'){
      this.deleteStudent(this.studentDeleteID)
    } 
  }

  ngOnInit() {
  this.getStudentData()
  }

  //Delete student
  deleteStudent(stuid){
     this.studentService.deleteStudent(stuid)
      .subscribe(
        data => {
           this.toastyService.success({
                  title: "Success",
                  msg: "Student deleted successfully",
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
              this.router.navigate(['/students']);
        },
        error => {
            let err = error.json();
        });
  }
  getStudentData(){
//console.log(this.currentUser.member_id);
	  this.studentService.getStudentData(this.currentUser.member_id)
            .subscribe(
                data => {
                    this.studentlistData = data['student'];
                    console.log('datatata'+this.studentlistData);
                },
                error => {
                   console.log(error);
                });
    }
  changeURL(){
      this.router.navigate(['/students/add']);
    }
}
