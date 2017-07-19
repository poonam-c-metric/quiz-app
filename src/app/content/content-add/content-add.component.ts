import { Component, OnInit } from '@angular/core';
import { Content } from '../../_models/index';
import { ContentService } from '../../_services/index'
import { FileUploader } from 'ng2-file-upload';
import { FileLikeObject } from 'ng2-file-upload';
import { ToastyService, ToastyConfig } from 'ng2-toasty';
import { ActivatedRoute , Router } from '@angular/router';

@Component({
  selector: 'app-content-add',
  templateUrl: './content-add.component.html',
  styleUrls: ['./content-add.component.css']
})

export class ContentAddComponent implements OnInit {

  contentData : any = {};
  contentID : string;
  public errorMessage : String;
  public uploader : FileUploader = new FileUploader({url:'http://localhost:3000/api/content/uploadDocument', autoUpload: true , allowedMimeType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif' , 'image/svg+xml', 'application/pdf', 'application/msword', 'application/vnd.ms-excel', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
],
   maxFileSize: 10*1024*1024});

  constructor(private contentService : ContentService , private toastyService : ToastyService, private router:Router, private route:ActivatedRoute) {
    this.contentID = route.snapshot.params['content_id'];
    if(typeof this.contentID != 'undefined'){
      this.getContentById(this.contentID)
    }
  }

  ngOnInit() {
    this.uploader.onWhenAddingFileFailed = (item, filter, options) => this.onWhenAddingFileFailed(item, filter, options);
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
      let res = JSON.parse(response);
      this.contentData.url_link = res.filename;
    };
  }

   onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any) {
      switch (filter.name) {
        case 'fileSize':
            this.errorMessage = `Maximum upload size exceeded (${item.size} of ${this.uploader.options.maxFileSize} allowed)`;
            console.log(this.errorMessage);
            break;
        case 'mimeType':
            const allowedTypes = this.uploader.options.allowedMimeType.join();
            this.errorMessage = `Type "${item.type} is not allowed. Allowed types: "${allowedTypes}"`;
            console.log(this.errorMessage);
            break;
        default:
            this.errorMessage = `Unknown error (filter is ${filter.name})`;
            console.log(this.errorMessage);
      }
    }

	useIcon(uimodal){
		uimodal.close();
	}

  /* Get content detail by id*/
  getContentById(contentid){
    this.contentService.getContentById(contentid)
      .subscribe(
        data => {
          this.contentData = data['content'][0];
          console.log(this.contentData);
        },
        error => {
          let err = error.json();
          console.log(err);
        });
  }

	addContent(){
		if(this.contentData.url_link==undefined || this.contentData.url_link==""){
			this.toastyService.error({
        title: 'Required',
        msg: 'Please add content Image',
        showClose: true,
        timeout: 5000,
        theme: "material"
      });
		}else if(this.contentData.web_image==undefined || this.contentData.web_image==""){
			this.toastyService.error({
        title: 'Required',
        msg: 'Please add content Icon',
        showClose: true,
        timeout: 5000,
        theme: "material"
      });
		}else	if(this.contentID!='' && this.contentID!=undefined){
        this.contentData['id_edited'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
        this.contentService.updateContent(this.contentData)
          .subscribe(
            data => {
              this.toastyService.success({
                  title: "Success",
                  msg: "Content updated successfully",
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
              this.router.navigate(['/content']);
            },
            error => {
                let err = error.json();
                this.toastyService.error({
                  title: err.code,
                  msg: err.message,
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
                });
            });
  	    }else{
  	      console.log(this.contentData);
  	      this.contentData['certificate_id'] = localStorage.getItem('certificate_id');
  	      this.contentData['id_added'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
  	      this.contentService.createContent(this.contentData)
  	        .subscribe(
  	          data => {
  	              this.toastyService.success({
  	                  title: "Success",
  	                  msg: "Content created successfully",
  	                  showClose: true,
  	                  timeout: 5000,
  	                  theme: "material"
  	              });
  	              this.router.navigate(['/content']);
  	          },
  	          error => {
  	              let err = error.json();
  	              this.toastyService.error({
  	                title: err.code,
  	                msg: err.message,
  	                showClose: true,
  	                timeout: 5000,
  	                theme: "material"
  	              });
  	          });
  	    }
	}

}