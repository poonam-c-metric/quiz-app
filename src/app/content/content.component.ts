import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../_services/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "email";
    public sortOrder = "asc";
    contentlistData : Object;

    constructor(private toastyService:ToastyService , private contentService:ContentService) {
    	this.getContentData(localStorage.getItem('certificate_id'));
    }

    ngOnInit(): void {

	}

    public toInt(num: string) {
        return +num;
    }

    public sortByWordLength = (a: any) => {
        return a.city.length;
    }

    getContentData(certificateid){
    	this.contentService.getContentData(certificateid)
	      .subscribe(
	          data => {
	          	console.log(data['content']);
	            if(data['content']!=undefined){
	              this.contentlistData = data['content'];
	            }else{
	              this.contentlistData = [];
	              this.toastyService.error({
	                title: data.code,
	                msg: data.message,
	                showClose: true,
	                timeout: 5000,
	                theme: "material"
	              });
	            }
	        });
	}
}