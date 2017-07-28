/*
  Author : Poonam Gokani
  Desc   : All Function need to integrate webservice of student login and forgot password
  Date   : 19/07/2017
 */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { StudentModuleService } from '../_services/index';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-studentlogin',
  templateUrl: './studentlogin.component.html',
  styleUrls: ['./studentlogin.component.css']
})
export class StudentloginComponent implements OnInit {

  model: any = {};
  constructor(private router:Router, private toastyService : ToastyService, private studentModuleService : StudentModuleService) { }

  ngOnInit() {

  }

/*
  Author : Poonam Gokani
  Desc   : Function to integrate angular service to perform action - student login
  Date   : 19/07/2017
 */
  studentLogin(){
    this.studentModuleService.login(this.model.student_active_email, this.model.student_password)
        .subscribe(
            data => {
              this.router.navigate(['/student/dashboard']);
            },
            error => {
              let err = error.json();
              this.toastyService.error({
                  title: "Login Failed",
                  msg: err.message,
                  showClose: true,
                  timeout: 5000,
                  theme: "material"
              });
            });
   }
}