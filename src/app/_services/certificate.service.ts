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
    return this.http.post('/api/createCertificate', certdata) //this.jwt()
    .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

  updateCertificate(certdata : Certificate){
    return this.http.post('/api/updateCertificate', certdata) //, this.jwt()
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

  deleteCertificateById(certid : number){
     console.log('Inside service');
     return this.http.delete("/api/deleteCertificateById?certificate_id="+certid)
     .map((response: Response) => {
        let data = response.json();
        return data;
      });
  }

  // private helper methods
  private jwt() {
      // create authorization header with jwt token
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.accessToken) {
          let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.accessToken });
          return new RequestOptions({ headers: headers });
      }
  }

}
