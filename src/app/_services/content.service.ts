import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Content } from '../_models/content';

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

  createContent(contentdata : Content){
      console.log('Inside create content');
      return this.http.post('/api/content/createContent', contentdata, this.jwt())
      .map((response: Response) => {
          console.log(response);
          let data = response.json();
          return data;
      });
  }

  updateContent(contentdata : Content){
    return this.http.post('/api/content/updateContent', contentdata, this.jwt())
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  getContentById(contentid : number){
    return this.http.get("/api/content/getContentById?resource_id="+contentid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  deleteContent(contentid : Number){
    return this.http.get("/api/content/deleteContent?resource_id="+contentid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  getTestTime(contentid : Number){
    console.log('Inside getTestTime');
    return this.http.get("/api/content/getTesttimeById?resource_id="+contentid)
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
