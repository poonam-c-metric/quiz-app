import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/index';
import { ToastyService } from 'ng2-toasty';
import { User } from '../_models/index';
import { ROUTES } from '../sidebar/sidebar-routes.config';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'navbar-cmp',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {

	private listTitles: any[];
    location: Location;
    currentUser: User;

    constructor(location:Location,private authenticationService : AuthenticationService, private router : Router , private toastyService : ToastyService) {
        this.location = location;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'))[0];
    }

    ngOnInit(){
        this.listTitles = ROUTES.filter(listTitle => listTitle);
    }

    getTitle(){
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if(titlee.charAt(0) === '#'){
            titlee = titlee.slice( 2 );
        }
        for(var item = 0; item < this.listTitles.length; item++){
            if(this.listTitles[item].path.replace("/","") === titlee){
                return this.listTitles[item].title;
            }
        }
        return 'Dashboard';
    }

	logout(){
      console.log("Inside Logout");
      this.authenticationService.logout().subscribe(
        data => {
            console.log("logout Response:");
            this.router.navigate(['/login']);
        },
        error => {
            let err = error.json();
            this.toastyService.error({
                title: "Logout Failed",
                msg: err.message,
                showClose: true,
                timeout: 5000,
                theme: "material"
            });
        });
    }
}
