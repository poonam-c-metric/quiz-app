import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { UserService } from '../_services/index';

@Injectable()
export class AuthGuard implements CanActivate {

    private accesstoken;

    constructor(private router: Router, private userservice : UserService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            console.log("Current User Exists");
            return true
        }

        if(state.url.indexOf('active')>0){
            let params = state.root.firstChild.fragment.split('?')[1].split('&');
            let data = [];
            params.forEach(function(d) {
                let pair = d.split('=');
                data.push({[pair[0]] : pair[1]});
            });
            this.userservice.makeUserActive(data[0]['userId'],data[1]['accessToken']);
        }
        console.log("Inside Else");
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }

}