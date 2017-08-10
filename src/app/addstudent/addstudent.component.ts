import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../_services/index';
import { User } from '../_models/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';
import {ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-addstudent',
  templateUrl: './addstudent.component.html',
  styleUrls: ['./addstudent.component.css']
})
export class AddstudentComponent implements OnInit {


  studentData : any = {};
  studentID : String;

  public errorMessage : String;
  public ecommerce : number;
  public showAdvancedFlag : boolean = false;

  constructor(private router: Router,private toastyService : ToastyService , private studentService : StudentService,private route: ActivatedRoute) {
    this.studentID = route.snapshot.params['student_id'];
    if(typeof this.studentID != 'undefined'){
      this.getStudentById(this.studentID)
    }
  }

  ngOnInit() {

  }

  /* Get student detail by id*/
  getStudentById(stuid){
    this.studentService.getStudentById(stuid)
      .subscribe(
        data => {
            this.studentData = data['student'][0];
            if(this.studentData['cert_cost']!==0){
              this.ecommerce = 1;
            }
        },
        error => {
            let err = error.json();
        });
  }

  createStudent(){
    if(this.studentID!='' && this.studentID!=undefined){
      this.studentData['id_edited'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
      this.studentData['certificate_id'] = localStorage.getItem('certificate_id');
      //this.studentData['is_active'] = 0;
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
              this.router.navigate(['/students']);
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
      this.studentData['id_added'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
      //this.studentData['is_active'] = 0;
      this.studentData['certificate_id'] = localStorage.getItem('certificate_id');
      this.studentService.createStudent(this.studentData)
        .subscribe(
          data => {
              this.toastyService.success({
                  title: "Success",
                  msg: "Student created successfully",
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
              this.router.navigate(['/students']);
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


}
