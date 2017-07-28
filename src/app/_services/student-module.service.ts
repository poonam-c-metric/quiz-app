/*
  Author : Poonam Gokani
  Desc   : Integration of webservice for action student login, logout and forgot password
  Date   : 19/07/2017
 */
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

@Injectable()
export class StudentModuleService {

	constructor(private http : Http) { }

	/*
	  Author : Poonam Gokani
  	  Desc   : Integration of webservice for action student login
  	  Date   : 19/07/2017
 	*/
	login(student_active_email: string, student_password: string) {
	    return this.http.post('/api/studentmodule/loginStudent',{ student_active_email: student_active_email, student_password: student_password })
	        .map((response: Response) => {
	            let data = response.json();
	            if (data && data.student) {
	            	localStorage.setItem('currentStudent',JSON.stringify(data.student));
	            	localStorage.setItem('currentUser',JSON.stringify(data.student));
	            	localStorage.setItem('studentAccessToken',data['student']['accessToken']);
	            }
	            return data.student;
	        });
	}

	/*
	  Author : Poonam Gokani
  	  Desc   : Integration of webservice for action student logout
  	  Date   : 21/07/2017
 	*/
	logout(){
		return this.http.post('/api/studentmodule/logoutStudent',{ })
	        .map((response: Response) => {
				return response;
	        });
	}

	/*
	  Author : Poonam Gokani
  	  Desc   : Integration of webservice for change student password
  	  Date   : 24/07/2017
 	*/
	updatePassword(pwddetails : Object){
        return this.http.post('/api/studentmodule/changeStudentPassword', pwddetails)
            .map((response: Response) => {
                let data = response.json();
                return data;
            })
    }

    /*
	  Author : Poonam Gokani
  	  Desc   : Integration of webservice for save student answers
  	  Date   : 25/07/2017
  	*/
 	saveStudentAnswer(ansdetails : Object){
 		return this.http.post('/api/studentmodule/saveStudentAnswer', ansdetails)
            .map((response: Response) => {
                let data = response.json();
                return data;
            })
 	}

}