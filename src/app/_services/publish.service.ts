/*
  Author : Poonam Gokani
  Desc   : To integrate all web services of publish certificate
 */
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class PublishService {

  constructor(private http : Http) { }

/*
  Author : Poonam Gokani
  Desc   : To integrate Webservice hasResourceData
  Date   : 31/07/2017
 */
  hasResource(certid){
    return this.http.get("/api/publish/hasResourceData?certificate_id="+certid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate Webservice hasQuestionData
  Date   : 01/08/2017
 */
  hasQuestionData(certid){
    return this.http.get("/api/publish/hasQuestionData?certificate_id="+certid)
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate Webservice publishCertificate
  Date   : 02/08/2017
*/
  publishCertificate(certdata){
    return this.http.post("/api/publish/publishCertificate",{'cert_data':certdata})
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }

/*
  Author : Poonam Gokani
  Desc   : To integrate Webservice unpublishCertificate
  Date   : 02/08/2017
*/
  unpublishCertificate(certdata){
    return this.http.post("/api/publish/unpublishCertificate",{'cert_data':certdata})
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }
}
