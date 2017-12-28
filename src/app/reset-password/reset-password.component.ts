import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/index';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, RouterState} from '@angular/router';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public passworddata : any = {};
  private accessToken : String;
  constructor(private router: Router , private toastyService : ToastyService , private userService : UserService) {
  	const state: RouterState = router.routerState;
    const snapshot: RouterStateSnapshot = state.snapshot;
    const root: ActivatedRouteSnapshot = snapshot.root;
    this.accessToken = root.queryParams['accessToken'];
  }

  ngOnInit() {
  }

  changePassword(pwddata){
	  this.userService.resetNewPassword(pwddata['newpassword'],this.accessToken)
        .subscribe(
            data => {
                this.toastyService.success({
                    title: 'Success',
                    msg: data.message,
                    showClose: true,
                    timeout: 5000,
                    theme: "material"
                });
            },
            error => {
                let err = error.json();
                this.toastyService.error({
                    title: 'Error',
                    msg: err.message,
                    showClose: true,
                    timeout: 5000,
                    theme: "material"
                });
            });
  }
}