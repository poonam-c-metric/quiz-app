import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Student } from '../_models/student';
@Injectable()
export class StudentService {

  constructor(private http : Http) { }

  getStudentData( certificateId : Number) {
    return this.http.get("/api/getStudentDetails?certificate_id="+certificateId)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  createStudent(studentData : Student){
      return this.http.post('/api/createStudent', studentData, this.jwt())
      .map((response: Response) => {
          let data = response.json();
          return data;
      });
  }

  updateStudent(studata : Student){
    return this.http.post('/api/updateStudent', studata, this.jwt())
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }


  deleteStudent(stuid : Number){
    return this.http.get("/api/deleteStudent?student_id="+stuid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  getStudentById(stuid : Number){
    return this.http.get("/api/getStudentById?student_id="+stuid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  // private helper methods
  private jwt() {
      // create authorization header with jwt token
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.token) {
          let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
          return new RequestOptions({ headers: headers });
      }
  }
}
