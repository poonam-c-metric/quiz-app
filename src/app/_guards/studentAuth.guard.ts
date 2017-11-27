/*
Author : Poonam Gokani
Desc   : Function to retrieve content data based on certificateid retrieve from student details
Date   : 01/08/2017
*/
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class StudentAuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(localStorage.getItem('currentStudent')) {
          console.log('Inside Current Student Exist mode');
          return true;
        }
        this.router.navigate(['/online-exam']);
        return false;
    }
}