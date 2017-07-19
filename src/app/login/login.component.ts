import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService , UserService } from '../_services/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    model: any = {};
    returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private toastyService: ToastyService
    ) { }

    ngOnInit() {
        if (localStorage.getItem('currentUser')) {
          this.router.navigate(['/']);
        }
    }

    login() {
        this.authenticationService.login(this.model.username, this.model.password)
        .subscribe(
            data => {
                console.log('login successful');
                this.router.navigate(['/']);
            },
            error => {
                console.log('Inside Error');
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

    resetPassword(emailid,fpmodal){
        this.userService.resetPassword(emailid)
            .subscribe(
                data => {
                    fpmodal.close();
                    this.toastyService.success({
                        title: data.code,
                        msg: data.message,
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