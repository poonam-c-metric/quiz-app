/*
  Author : Poonam Gokani
  Desc   : To get report details 
 */
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class ReportService {

  constructor(private http : Http) { }

/*
  Author : Poonam Gokani
  Desc   : To integrate Webservice to get report data
  Date   : 09/10/2017
*/
  generateReportData(reportdata){
    console.log(reportdata);
    return this.http.post("/api/report/generateReportData",{'report_data':reportdata})
     .map((response: Response) => {
        let data = response.json();
        return data;
    });
  }
}
