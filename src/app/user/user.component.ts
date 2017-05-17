import { Component, OnInit } from '@angular/core';
import { User } from '../_models/index';
import { UserService } from '../_services/index';
import {ToastyService, ToastyConfig} from 'ng2-toasty';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user : User;

  constructor(private userService : UserService , private toastyService : ToastyService) {
  	this.user = JSON.parse(localStorage.getItem('currentUser'))[0];
  }

  ngOnInit() {
  }

  updateUser(){
  	this.userService.updateUserData(this.user)
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
