import { Component, OnInit } from '@angular/core';
import { Options } from 'angular-2-daterangepicker';
import { ReportService } from '../_services/index';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})

export class ReportComponent implements OnInit {
  
  constructor(private reportService : ReportService ) { }

  private daterangepickerOptions : object = {    
    format: 'DD/MM/YYYY',
    startDate: '01/10/2017',
    endDate: '15/10/2017',
    showRanges: true
  }
  private reportData : object = {} 

  ngOnInit() {
  }

  generateReport(){
    console.log('Inside generate Report');
    console.log('Inside Report');
    this.reportData = {
      'fromDate': '01/06/2017',
      'toDate': '30/10/2017'
    }
    this.reportService.generateReportData(this.reportData)
      .subscribe(
        data => {
          console.log(data);  
        },
        error => {
          console.log(error);    
      });  
  }

}