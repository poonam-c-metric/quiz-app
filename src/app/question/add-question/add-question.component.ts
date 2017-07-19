import { Component, OnInit } from '@angular/core';
import { ToastyService, ToastyConfig } from 'ng2-toasty';
import { ActivatedRoute , Router } from '@angular/router';
import { QuestionService } from '../../_services/index';
import { FileUploader } from 'ng2-file-upload';
import { FileLikeObject } from 'ng2-file-upload';
import { RequestOptions, Request, RequestMethod, Headers} from '@angular/http';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {

  private questionData : any = {};
  private questionDetails : any = {};
  private selectedValue : number ;
  private noofans : number = 2;
  private Oldnoofans : number = 0;
  private questionID : String ;
  private answerEmptyFlag : boolean = false;
  public questiontype : string ;
  public pageLoad : boolean = false;
  public pageLoading : boolean = false;
  public uploader : FileUploader = new FileUploader({url:'http://localhost:3000/api/question/uploadQuestion/', autoUpload: true , allowedMimeType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif' , 'image/svg+xml'],
  maxFileSize: 10*1024*1024});
  items = ['single','multiple','image','dynamic'];
  droppedItems = [];
  fileName = [];
  public errorMessage : String;
  public lastIndex : number;

  constructor(private toastyService : ToastyService, private questionService : QuestionService, private router : Router, private route : ActivatedRoute) {

  }

  ngOnInit() {
    this.questionData['answers'] = [];
    this.questionID = this.route.snapshot.params['question_id'];
    if(typeof this.questionID != 'undefined'){
      this.getQuestionById(this.questionID)
    }

    this.selectedValue = 0;
    this.noofans = 4;
    for(let i = 0; i < this.noofans; i++){
      if( i >= this.Oldnoofans){
        this.questionData['answers'][i] = {};
      }
      if(i == this.noofans-1){
        this.Oldnoofans = this.noofans;
      }
    }

    this.uploader.onWhenAddingFileFailed = (item, filter, options) => this.onWhenAddingFileFailed(item, filter, options);
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
      let res = JSON.parse(response);
      //this.fileName[this.lastIndex] = res.filename;
      this.questionData['answers'][this.lastIndex]['answer_text'] = res.filename;
      console.log(this.questionData['answers'][this.lastIndex]['answer_text']);
    };
  }

  onSelectionChange(index){
     this.selectedValue = index;
  }

  initizeVar(){
    if(this.questionData.question_type=='image'){
      this.noofans = 4;
    }
    for(let i = 0; i < this.noofans; i++){
      if( i >= this.Oldnoofans){
        this.questionData['answers'][i] = {};
      }
      if(i == this.noofans-1){
        this.Oldnoofans = this.noofans;
      }
    }
  }

  createQuestion(fm){
    this.answerEmptyFlag = false;
    if(this.questionID!='' && this.questionID!=undefined){
      this.questionDetails['old_answers'] = [];
      this.questionDetails['answers'] = [];
      this.questionDetails['answers_available'] = [];
      for(var i = 0;i < this.noofans; i++){
        if(fm.controls['answer'+i].errors!=null && fm.controls['answer'+i].errors.required){
          this.answerEmptyFlag = true;
          break;
        }
        if(i===this.selectedValue && this.questionData.question_type=='single'){
          this.questionData['answers'][i]['is_correct'] = true;
        }else if(this.questionData.question_type=='single'){
          this.questionData['answers'][i]['is_correct'] = false;
        }
        if(this.questionData['answers'][i]['answer_id']){
          this.questionDetails['old_answers'].push(this.questionData['answers'][i]);
          this.questionDetails['answers_available'].push(this.questionData['answers'][i]['answer_id']);
        }else{
          this.questionDetails['answers'].push(this.questionData['answers'][i]);
        }
      }
      if(!this.answerEmptyFlag){
        this.questionDetails['question_id'] = this.questionData['question_id'];
        this.questionDetails['is_active'] = 1;
        this.questionDetails['question_text'] = this.questionData['question_text'];
        this.questionDetails['id_edited'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
        console.log(this.questionDetails);
        this.questionService.updateQuestion(this.questionDetails)
          .subscribe(
            data => {
              this.toastyService.success({
                  title: "Success",
                  msg: "Question updated successfully",
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
              this.router.navigate(['/questions']);
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
    }else{
      for(var i = 0;i < this.noofans; i++){
        if(this.questionData.question_type !='image' && this.questionData.question_type !='dynamic'){
          if(fm.controls['answer'+i].errors!=null && fm.controls['answer'+i].errors.required){
            this.answerEmptyFlag = true;
            break;
          }
        }
        else if(this.questionData.question_type =='image'){
          this.questionData['answers'][i]['answer_text'] = 'smily'+i+'.png';
        }/*else if(this.questionData.question_type =='dynamic'){
          this.questionData['answers'][i]['answer_text'] = this.fileName[i];
        }*/
        if(i===this.selectedValue && (this.questionData.question_type=='single' || this.questionData.question_type=='image' || this.questionData.question_type=='dynamic')){
          this.questionData['answers'][i]['is_correct'] = true;
        }else if(this.questionData.question_type=='single' || this.questionData.question_type=='image' || this.questionData.question_type=='dynamic'){
          this.questionData['answers'][i]['is_correct'] = false;
        }else if(this.questionData.question_type=='multiple'){
          if(this.questionData['answers'][i]['is_correct']==undefined){
            this.questionData['answers'][i]['is_correct'] = false;
          }
        }
      }
      if(!this.answerEmptyFlag){
        this.questionData['id_added'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
        this.questionData['is_active'] = 1;
        this.questionData['certificate_id'] = localStorage.getItem('certificate_id');
        this.questionData['section_id'] = localStorage.getItem('content_id');
        console.log(this.questionData);
        this.questionService.createQuestion(this.questionData)
          .subscribe(
            data => {
                this.toastyService.success({
                    title: "Success",
                    msg: "Question created successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: "material"
                });
                this.router.navigate(['/questions']);
            },
            error => {
                let err = error.json();;
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

  getQuestionById(questionid){
    this.questionService.getQuestionById(questionid)
      .subscribe(
        data => {
          this.questionData = data['question'][0];
          console.log(this.questionData);
          console.log(this.questionData.question_type);
          this.questionData['answers'] = {};
          this.noofans = data['answers'].length;
          this.Oldnoofans = this.noofans ;
          this.questionData['answers']=data['answers'];
          this.pageLoad = true;
          this.pageLoading = false;
          for(var ans=0;ans<data['answers'].length;ans++){
            if(data['answers'][ans]['is_correct']){
              if(this.questionData.question_type == 'image'){
                this.selectedValue = parseInt(this.questionData['answers'][ans]['answer_text'].substr(5,1));
              }else{
                this.selectedValue = ans;
              }
            }
          }
        },
        error => {
          let err = error.json();
          console.log(err);
        });
  }

  onItemDrop(e: any) {
    this.pageLoad = false;
    this.pageLoading = true;
    console.log(e.dragData);
    setTimeout(() => {
      this.pageLoad = true;
      this.pageLoading = false;
      this.questionData.question_type = e.dragData;
    },1000);
  }

  onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any) {
      switch (filter.name) {
        case 'fileSize':
            this.errorMessage = `Maximum upload size exceeded (${item.size} of ${this.uploader.options.maxFileSize} allowed)`;
            break;
        case 'mimeType':
            const allowedTypes = this.uploader.options.allowedMimeType.join();
            this.errorMessage = `Type "${item.type} is not allowed. Allowed types: "${allowedTypes}"`;
            break;
        default:
            this.errorMessage = `Unknown error (filter is ${filter.name})`;
      }
  }

  fileUploadDetector(fileInput: any , uploadIndex: number){
    console.log(uploadIndex);
    this.lastIndex = uploadIndex;
    console.log(this.lastIndex);
  }
}