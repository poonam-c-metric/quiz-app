import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Certificate } from '../_models/certificate';

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

  createCertificate(certdata : Certificate){
    console.log("Inside Create Certificate Service"+JSON.stringify(certdata));
      return this.http.post('/api/createCertificate', certdata, this.jwt())
      .map((response: Response) => {
          let data = response.json();
          return data;
      });
  }

  updateCertificate(certdata : Certificate){
    console.log("Inside Update Certificate Service"+JSON.stringify(certdata));
    return this.http.put('/api/updateCertificate', certdata, this.jwt())
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  getCertificateById(certid : number){
    return this.http.get("/api/getCertificateById?certificate_id="+certid)
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
