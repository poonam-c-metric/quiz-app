import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Student } from '../_models/student';
@Injectable()
export class StudentService {

  constructor(private http : Http) { }

  getStudentData( memberId : Number) {
  
    return this.http.get("/api/getStudentDetails?member_id="+memberId)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  createStudent(studentData : Student){
    console.log("Inside Create Student Service"+JSON.stringify(studentData));
      return this.http.post('/api/createStudent', studentData, this.jwt())
      .map((response: Response) => {
          let data = response.json();
          console.log("let data"+data);
          return data;
      });
  }

  updateStudent(studata : Student){
    return this.http.put('/api/updateStudent', studata, this.jwt())
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
