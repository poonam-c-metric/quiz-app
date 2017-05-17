import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../_services/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

    user: any = {};
    public verified : any;
    public siteKey: string = "6Le8ySAUAAAAALcVLSQYoiiaw-7PTucjWgzmU84Y";
    public theme: string = "light";

    constructor(
        private router: Router,
        private userService: UserService,
        private toastyService:ToastyService,
        private toastyConfig: ToastyConfig
    ) { }

    ngOnInit(){
     //called after the constructor and called  after the first ngOnChanges()
      if (localStorage.getItem('currentUser')) {
          // logged in so return true
          console.log("Current User Exists");
          this.router.navigate(['/']);
      }
  	}

    setVerified(data) {
        console.log(data) // data will return true while successfully verified
    }

    register(user) {
        this.user.recaptcha = (<HTMLInputElement>document.getElementById("g-recaptcha-response")).value;
        if(this.user.recaptcha === undefined || this.user.recaptcha === '' || this.user.recaptcha === null) {
          this.toastyService.warning({
              title: "Field Required",
              msg: "Please select captcha",
              showClose: true,
              timeout: 5000,
              theme: "material"
          });
        }else{
          console.log(this.user);
          this.userService.create(this.user)
            .subscribe(
                data => {
                    this.toastyService.success({
                        title: "Success",
                        msg: "Registration Successfully",
                        showClose: true,
                        timeout: 5000,
                        theme: "material"
                    });
                    if (data.user && data.user[0].accessToken) {
                      localStorage.setItem('currentUser', JSON.stringify(data.user));
                    }
                    this.router.navigate(['/']);
                },
                error => {
                    let err = error.json();
                    this.toastyService.error({
                      title: "Registration Fail",
                      msg: err.message,
                      showClose: true,
                      timeout: 5000,
                      theme: "material"
                  });
                });
      }
    }
}