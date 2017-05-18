import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class CertificateService {

  constructor(private http : Http) {

  }

  getCertificateData( memberId : Number) {
    return this.http.get("/api/getCertificateDetails?member_id="+memberId)
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
