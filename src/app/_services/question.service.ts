/*
  Author : Poonam Gokani
  Desc   : To integrate all web services of questions and preview test
 */

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class QuestionService {

  constructor(private http : Http) { }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of get all question details based on section id.
  Date   : 14/06/2017
 */
  getQuestionData( sectionId : Number) {
    return this.http.get("/api/question/getQuestionDetails?section_id="+sectionId)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice to get all question Ids
  Date   : 12/07/2017
 */
  getQuestionIds( sectionId : Number) {
    return this.http.get("/api/question/getQuestionIds?section_id="+sectionId)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of create question
  Date   : 19/06/2017
 */
  createQuestion(questiondata : Object){
    return this.http.post('/api/question/createQuestion', questiondata, this.jwt())
    .map((response: Response) => {
        console.log(response);
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of update question details
  Date   : 20/06/2017
 */
  updateQuestion(questiondata : Object){
    return this.http.post('/api/question/updateQuestion', questiondata, this.jwt())
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of get question based on question id passed
  Date   : 19/06/2017
 */
  getQuestionById(questionid : number){
    return this.http.get("/api/question/getQuestionById?question_id="+questionid)
     .map((response: Response) => {
        let data = response.json();
        console.log(data);
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of change question status (active/inactive)
  Date   : 27/06/2017
 */
  changeQuestionStatus(questionStatus : Object) {
    return this.http.post('/api/question/changeQuestionStatus', questionStatus, this.jwt())
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of delete question
  Date   : 27/06/2017
 */
  deleteQuestion(questionid : Number){
    return this.http.get("/api/question/deleteQuestion?question_id="+questionid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of test configuration (Set test time and correct answers need to pass)
  Date   : 30/06/2017
 */
  saveTestConfiguration(testdata : Object){
    return this.http.post('/api/question/saveTestConfiguration', testdata, this.jwt())
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate webservice of retrieve test configuration
  Date   : 30/06/2017
 */
  getTestConfiguration(contentid : number){
    return this.http.get("/api/question/getTestConfiguration?content_id="+contentid)
     .map((response: Response) => {
        let data = response.json();
        console.log(data);
        return data;
    });
  }

  // private helper methods -- Code need to remove in future
  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
        let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
        return new RequestOptions({ headers: headers });
    }
  }
}
