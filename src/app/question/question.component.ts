import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';
import { ActivatedRoute , Router } from '@angular/router';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit {

  public filterQuery = "";
  public rowsOnPage = 10;
  public sortBy = "order";
  public sortOrder = "asc";
  public testSetting : any = {};
  public max : Object;
  questionlistData : Object;
  questionDeleteID : number;
  contentID : string;

  constructor(private questionService:QuestionService, private toastyService:ToastyService, private route: ActivatedRoute , private router:Router) { }

  ngOnInit() {
    this.contentID = this.route.snapshot.params['content_id'];
    if(typeof this.contentID != 'undefined'){
      localStorage.setItem('content_id',this.contentID);
    }else{
      this.contentID = localStorage.getItem('content_id');
    }
    this.getQuestionData(this.contentID);
    var b= new Date();
    this.testSetting.testtime = b;
    this.testSetting.testtime.setHours(0,0);
    var d=new Date();
    d.setHours(5,0);
    this.max = d;
  }

  getQuestionData(sectionid){
	  this.questionService.getQuestionData(sectionid)
      .subscribe(
          data => {
          	console.log(data['question']);
            if(data['question']!=undefined){
              this.questionlistData = data['question'];
            }else{
              this.questionlistData = [];
              this.toastyService.error({
                title: data.code,
                msg: data.message,
                showClose: true,
                timeout: 5000,
                theme: "material"
              });
            }
        });

    this.questionService.getTestConfiguration(sectionid)
      .subscribe(
          data => {
            if(data && data['testdata']!=undefined){
              console.log(data['testdata']);
              if(data['testdata']['test_time']!='' && data['testdata']['test_time']!=null){
                this.testSetting.limit_testtime = true;
                let testtime = data['testdata']['test_time'].split(":");
                this.testSetting.testtime.setHours(testtime[0],testtime[1]);
              }
              this.testSetting['correct_answer'] = data['testdata']['correct_answer'];
            }
        });
	  }

  changeQuestionStatus(status,questionid){
    console.log('Inside change Question Status'+status);
    var questionData = {'is_active':status,'question_id':questionid};
    this.questionService.changeQuestionStatus(questionData)
      .subscribe(data => {
          this.toastyService.success({
            title: data.code,
            msg: data.message,
            showClose: true,
            timeout: 5000,
            theme: "material"
          });
        },error =>{
          let errdetail=error.json();
          this.toastyService.error({
            title: errdetail.code,
            msg: errdetail.message,
            showClose: true,
            timeout: 5000,
            theme: "material"
          });
        });
  }

  openDeleteQuestionModal(questiontid,dqmodal){
     dqmodal.open();
     this.questionDeleteID = questiontid;
  }

  deleteQuestion(questionid,dcmodal){
    console.log('Inside delete Question');
    this.questionService.deleteQuestion(questionid)
      .subscribe(
        data => {
          dcmodal.close();
          this.toastyService.success({
              title: "Success",
              msg: "Question deleted successfully",
              showClose: true,
              timeout: 5000,
              theme: "material"
          });
          this.getQuestionData(localStorage.getItem('content_id'));
          this.router.navigate(['/questions']);
        },
        error => {
            let err = error.json();
            this.toastyService.success({
              title: err.code,
              msg: err.message,
              showClose: true,
              timeout: 5000,
              theme: "material"
            });
        });
  }

  setTestSetting(){
    let testdata = {};
    testdata['test_time'] = this.testSetting.testtime.getHours() + ":" + this.testSetting.testtime.getMinutes();
    testdata['correct_answer'] = this.testSetting.correct_answer;
    testdata['resource_id'] = localStorage.getItem('content_id');
    this.questionService.saveTestConfiguration(testdata)
      .subscribe(
        data => {
          this.toastyService.success({
              title: "Success",
              msg: "Test Configuration Done.",
              showClose: true,
              timeout: 5000,
              theme: "material"
          });
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