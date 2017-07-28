/*
  Author : Poonam Gokani
  Desc   : All Function need to create Question Panel and End Test
  Date   : 11/07/2017
 */

import { Component, OnInit, Directive, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { QuestionService, ContentService, StudentModuleService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';
import { Observable, Subscription } from 'rxjs/Rx';

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
  private testtime : string = "";
  private timeArr : Array<any> = [];
  private savedAnswer : Array<any> = [];

  ticks = 0;

  minutesDisplay: number = 0;
  hoursDisplay: number = 0;
  secondsDisplay: number = 0;

  sub: Subscription;

  constructor(private route: ActivatedRoute, private router:Router, private questionService: QuestionService, private toastyService: ToastyService, private contentService : ContentService, private studentModuleService : StudentModuleService) {
  	this.contentID = route.snapshot.params['content_id'];
  	this.getQuestionIds(this.contentID);
    this.getTestTime(this.contentID);
  }

  ngOnInit() {
    this.startTimer();
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
    this.currentQuestionId = questionid ;
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
    let temp = {};
    let loopcounter = 0;
    let answer = {};
    let student_id = JSON.parse(localStorage.getItem('currentStudent')).student_id;
    let certificate_id = JSON.parse(localStorage.getItem('currentStudent')).certificate_id;
    for (let qdata in this.questionData){
      temp = {};
      answer = {};
      temp['question_text'] = this.questionData[qdata].question_text;
      loopcounter = 0;
      answer['question_id'] = this.questionData[qdata].question_id;
      answer['certificate_id'] = certificate_id;
      answer['section_id'] = this.contentID;
      answer['student_id'] = student_id;
      for(let ansdata in this.questionData[qdata].answers){
        if(this.questionData[qdata].answers[ansdata]['attempted'] == true){
          console.log("Inside If");
          console.log(this.questionData[qdata].answers[ansdata]['answer_id']);
          answer['answer_id'] = this.questionData[qdata].answers[ansdata]['answer_id'];
          temp['your_answer'] = this.questionData[qdata].answers[ansdata]['answer_text'];
        }
        if(this.questionData[qdata].answers[ansdata]['is_correct'] == true){
          if(JSON.parse(this.questionData[qdata].answers[ansdata]['is_correct']) == JSON.parse(this.questionData[qdata].answers[ansdata]['attempted'])){
            temp['status'] = "Right"
            answer['passfail'] = 1
          }
        }
        loopcounter++;
      }
      if(loopcounter == this.questionData[qdata].answers.length && temp['status'] == undefined){
        temp['status'] = 'Wrong';
        answer['passfail'] = 0 ;
      }
      this.resultData.push(temp);
      this.savedAnswer.push(answer);
    }
    this.saveStudentAnswer();
  }

/*
  Author : Poonam Gokani
  Desc   : Function for integrating webservice of save student answer
  Date   : 25/07/2017
 */
  saveStudentAnswer(){
    console.log('Inside Saved Student Answer');
    console.log(this.savedAnswer);
    this.studentModuleService.saveStudentAnswer({'answers':this.savedAnswer})
      .subscribe(
          data => {
            if(data.status=="1"){
                this.toastyService.success({
                    title: data.code,
                    msg: data.message,
                    showClose: true,
                    timeout: 5000,
                    theme: "material"
                });
            }
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


/*
  Author : Poonam Gokani
  Desc   : Function to get testtime details from the contentid passed
  Date   : 25/07/2017
*/
  getTestTime(contentid){
    this.contentService.getTestTime(contentid)
      .subscribe(
          data => {
            if(data['test_time']!=undefined){
              this.testtime = data['test_time'];
              this.timeArr = this.testtime.split(":");
            }
        });
  }

/*
  Author : Poonam Gokani
  Desc   : Function to subscribe timer when component initiate & unsubscibe it after specific time
  Date   : 25/07/2017
*/
  private startTimer() {
    let timer = Observable.timer(40, 1000);
    this.sub = timer.subscribe(
        t => {
          this.ticks = t;
          this.secondsDisplay = this.getSeconds(this.ticks);
          this.minutesDisplay = this.getMinutes(this.ticks);
          this.hoursDisplay = this.getHours(this.ticks);
          if(this.secondsDisplay == this.timeArr[2].split('.')[0] && this.minutesDisplay == this.timeArr[1] && this.hoursDisplay == this.timeArr[0]){
            this.sub.unsubscribe();
          }
        }
    );
  }

/*
  Author : Poonam Gokani
  Desc   : Funtion to get seconds from time
  Date   : 25/07/2017
 */
  private getSeconds(ticks: number) {
    return this.pad(ticks % 60);
  }

/*
  Author : Poonam Gokani
  Desc   : Funtion to get minutes from time
  Date   : 25/07/2017
 */
  private getMinutes(ticks: number) {
    return this.pad((Math.floor(ticks / 60)) % 60);
  }

/*
  Author : Poonam Gokani
  Desc   : Funtion to get hours from time
  Date   : 25/07/2017
 */
  private getHours(ticks: number) {
    return this.pad(Math.floor((ticks / 60) / 60));
  }

/*
  Author : Poonam Gokani
  Desc   : Funtion to concate 0 for single digit number
  Date   : 25/07/2017
 */
  private pad(digit: any) {
    return digit <= 9 ? '0' + digit : digit;
  }

  ngOnDestroy() {

  }
}
