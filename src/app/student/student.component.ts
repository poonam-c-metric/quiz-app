
/*
  Author : Poonam Gokani
  Desc   : List student data , provide facility to add new student and upload student data
  Date   : 29/05/2017
*/

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../_services/index';
import { User } from '../_models/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';
import { ActivatedRoute } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { FileLikeObject } from 'ng2-file-upload';
import { API_URL } from './../_guards/configure';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})

export class StudentComponent implements OnInit {

  currentUser : User;
  studentDeleteID : String;
  studentlistData : Object;
  errorMessage : String;
  public filterQuery = "";
  public rowsOnPage = 10;
  public sortBy = "email";
  public sortOrder = "asc";
  public uploader : FileUploader = new FileUploader({url: API_URL + '/uploadStudent',
     autoUpload: true ,
     allowedMimeType: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
     maxFileSize: 10*1024*1024,
     additionalParameter: {'certificate_id': localStorage.getItem('certificate_id')}});

  constructor(private router : Router,private toastyService : ToastyService ,private studentService : StudentService,
    private route: ActivatedRoute){
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.uploader.onWhenAddingFileFailed = (item, filter, options) => this.onWhenAddingFileFailed(item, filter, options);
      this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
        let res = JSON.parse(response);
        console.log(res.filename);
      };
  }

  ngOnInit() {
    this.getStudentData(localStorage.getItem('certificate_id'));
  }

/*
  Author : Poonam Gokani
  Desc   : Function Used to open delete student modal
  Date   : 31/05/2017
*/
  openDeleteStudentModal(studid,dsmodal){
    dsmodal.open();
    this.studentDeleteID = studid;
  }

/*
  Author : Poonam Gokani
  Desc   : Function called to delete student details
  Date   : 31/05/2017
*/
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

/*
  Author : Poonam Gokani
  Desc   : Function called to get student details
  Date   : 30/06/2017
*/
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


/*
  Author : Poonam Gokani
  Desc   : Function called when click on Add New Student
  Date   : 31/05/2017
*/
  changeURL(){
      this.router.navigate(['/students/add']);
  }

/*
  Author : Poonam Gokani
  Desc   : Function called when multiple student upload data failed
  Date   : 17/08/2017
*/
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
