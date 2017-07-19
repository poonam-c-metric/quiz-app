/*
  Author : Poonam Gokani
  Desc   : All Function need to create Question Panel and End Test
  Date   : 11/07/2017
 */

import { Component, OnInit, Directive, Input } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { QuestionService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-examination',
  templateUrl: './examination.component.html',
  styleUrls: ['./examination.component.css']
})

export class ExaminationComponent implements OnInit {

  private contentID : string;
  private questionlistData : Array<any>;
  private questionData : Object = {};
  private activeStatus: Array<boolean> = [];
  private currentQuestion : number;
  private currentQuestionId : string;
  private resultData : Array<any> = [];
  private resultDashoboard : boolean = false;

  constructor(private route: ActivatedRoute, private router:Router, private questionService: QuestionService, private toastyService: ToastyService) {
  	this.contentID = route.snapshot.params['content_id'];
  	this.getQuestionIds(this.contentID);
  }

  ngOnInit() {

  }


/*
  Author : Poonam Gokani
  Desc   : To create range for loop
  Date   : 11/07/2017
 */
  range = (value) => {
    let a = [];
    for(let i = 0; i < value; ++i) {
      a.push(i)
    }
    return a;
  }

/*
  Author : Poonam Gokani
  Desc   : To get all question IDs from sectionid and display it in question panel
  Date   : 11/07/2017
 */
  getQuestionIds(sectionid){
  	this.questionService.getQuestionIds(sectionid)
  	.subscribe(
  	  data => {
  	    if(data['question']!=undefined){
  	      this.questionlistData = data['question'];
          this.currentQuestion = 0;
          this.currentQuestionId = this.questionlistData[0].question_id;
  	      this.getQuestionById(this.questionlistData[0].question_id);
  	    } else {
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
  }


/*
  Author : Poonam Gokani
  Desc   : To get question detail of particular question by passing if
  Date   : 12/07/2017
 */
  getQuestionById(questionid){
    if(this.questionData[this.currentQuestionId]==undefined){
      this.questionData[this.currentQuestionId] = {};
  	  this.questionService.getQuestionById(questionid)
        .subscribe(
          data => {
            this.questionData[this.currentQuestionId] = data['question'][0];
            this.questionData[this.currentQuestionId]['answers'] = data['answers'];
              for(let i=0;i<this.questionData[this.currentQuestionId]['answers'].length;i++)
                this.questionData[this.currentQuestionId]['answers'][i]['attempted'] = false;
        },
        error => {
          let err = error.json();
        });
    } else {
      console.log('Inside Else');
      this.currentQuestionId = questionid ;
      console.log(this.questionData[this.currentQuestionId]);
    }
  }

/*
  Author : Poonam Gokani
  Desc   : To highlight currently active question in question panel
  Date   : 13/07/2017
 */
  changeActiveStatus(index : number){
    this.currentQuestion = index;
    this.activeStatus[index] = true;
    for(let i = 0; i < this.activeStatus.length; ++i) {
      if(i!=index)
        this.activeStatus[index] = false;
    }
  }

/*
  Author : Poonam Gokani
  Desc   : Called when user call submit and next button to display next available question
  Date   : 14/07/2017
 */

  getNextQuestion(){
    this.currentQuestion = this.currentQuestion + 1;
    if(this.currentQuestion < this.questionlistData.length){
      this.currentQuestionId = this.questionlistData[this.currentQuestion].question_id;
      if(this.questionData[this.currentQuestionId]==undefined)
        this.getQuestionById(this.questionlistData[this.currentQuestion].question_id);
    }
  }

/*
  Author : Poonam Gokani
  Desc   : Generate Result Dashaboard based on question answered
  Date   : 17/07/2017
 */

  generateResultDashboard(){
    this.resultDashoboard = true;
    console.log(this.questionData);
    let temp = {};
    let loopcounter = 0;
    for (let qdata in this.questionData){
      temp = {};
      temp['question_text'] = this.questionData[qdata].question_text;
      loopcounter = 0;
      for(let ansdata in this.questionData[qdata].answers){
        if(this.questionData[qdata].answers[ansdata]['attempted'] == "true"){
          temp['your_answer'] = this.questionData[qdata].answers[ansdata]['answer_text'];
        }
        if(this.questionData[qdata].answers[ansdata]['is_correct'] == true){
          if(JSON.parse(this.questionData[qdata].answers[ansdata]['is_correct']) == JSON.parse(this.questionData[qdata].answers[ansdata]['attempted'])){
            temp['status'] = "Right"
          }
        }
        loopcounter++;
      }
      if(loopcounter == this.questionData[qdata].answers.length && temp['status'] == undefined)
        temp['status'] = 'Wrong'
      this.resultData.push(temp);
    }
  }
}
