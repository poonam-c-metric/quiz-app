import { Component, OnInit } from '@angular/core';
import { ROUTES } from './sidebar-routes.config';
import { Router } from '@angular/router';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    constructor(private router : Router, private toastyService:ToastyService) {
      this.router.events.subscribe(path => {
        let current = path['url'];
        let mainmenu = (<HTMLScriptElement[]><any>document.getElementById("MainMenu").querySelectorAll('a'));
        for (let elem of mainmenu) {
          if(current.indexOf(elem.innerHTML.toLowerCase()) !== -1){
            $(elem).addClass('active');
          }
        }
      });
    }

    ngOnInit() {
      //$.getScript('../../assets/js/sidebar-moving-tab.js');
      this.menuItems = ROUTES.filter(menuItem => menuItem);
    }

    getCertificateId(routerLink,elem){
        if(localStorage.getItem('certificate_id')!="" && localStorage.getItem('certificate_id')!=undefined){
           this.router.navigate([routerLink]);
           let elements = elem.target.parentElement.getElementsByClassName("list-group-item active");
           while (elements.length) elements[0].classList.remove('active');
           let elements1 = elem.target.parentElement.parentElement.getElementsByClassName("list-group-item active");
           while (elements1.length) elements1[0].classList.remove('active');
           let elements2 = elem.target.parentElement.parentElement.parentElement.getElementsByClassName("list-group-item active");
           while (elements2.length) elements2[0].classList.remove('active');
           elem.target.classList.add('active');
        }else{
            this.toastyService.warning({
              title: 'Select Certificate',
              msg: 'Please select any certificate first',
              showClose: true,
              timeout: 3000,
              theme: "material"
            });
        }
    }
}
