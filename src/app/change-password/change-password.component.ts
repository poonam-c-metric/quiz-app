import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  public changepwddata : any = {};

  constructor(private userService : UserService , private toastyService : ToastyService) { }

  ngOnInit() {

  }

  updatePassword(changepwddata){
  	changepwddata['member_id'] = JSON.parse(localStorage.getItem('currentUser')).member_id;
	  this.userService.updatePassword(changepwddata)
        .subscribe(
            data => {
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