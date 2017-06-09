import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Student } from '../_models/student';
@Injectable()
export class ContentService {

  constructor(private http : Http) { }

  getContentData( certificateId : Number) {
    return this.http.get("/api/content/getContentDetails?certificate_id="+certificateId)
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
