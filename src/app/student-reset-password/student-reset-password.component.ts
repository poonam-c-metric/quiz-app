/*
  Author : Poonam Gokani
  Desc   : Component used to dipaly UI for reset student password and contains its functions
  Date   : 31/07/2017
*/
import { Component, OnInit } from '@angular/core';
import { StudentModuleService } from '../_services/index';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, RouterState} from '@angular/router';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-student-reset-password',
  templateUrl: './student-reset-password.component.html',
  styleUrls: ['./student-reset-password.component.css']
})
export class StudentResetPasswordComponent implements OnInit {

  public passworddata : any = {};
  private accessToken : String;
  constructor(private router: Router , private toastyService : ToastyService , private studentModuleService : StudentModuleService) {
  	const state: RouterState = router.routerState;
    const snapshot: RouterStateSnapshot = state.snapshot;
    const root: ActivatedRouteSnapshot = snapshot.root;
    this.accessToken = root.queryParams['accessToken'];
  }

  ngOnInit() {
  }

/*
  Author : Poonam Gokani
  Desc   : Function user to reset student password
  Date   : 31/07/2017
*/
  changePassword(pwddata){
	  this.studentModuleService.resetNewPassword(pwddata['newpassword'],this.accessToken)
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