import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarModule } from './sidebar/sidebar.module';


import { AuthGuard } from './_guards/index';
import { AuthenticationService, UserService, CertificateService } from './_services/index';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import {GoogleRecaptchaDirective} from '../../node_modules/angular2-google-recaptcha/directives/googlerecaptcha.directive';

import { CustomFormsModule } from '../../node_modules/ng2-validation/dist/index';
import { ToastyModule } from 'ng2-toasty';
import { ModalModule } from "ng2-modal";
import { CertificateComponent } from './certificate/certificate.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UserComponent } from './user/user.component';
//import { UiSwitchModule } from '../../node_modules/angular2-ui-switch/dist/index';
import { UiSwitchModule } from 'ngx-ui-switch/src';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    GoogleRecaptchaDirective,
    CertificateComponent,
    HomeComponent,
    NavbarComponent,
    UserComponent,
    FileSelectDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    SidebarModule,
    CustomFormsModule,
    ModalModule,
    UiSwitchModule,
    ToastyModule.forRoot()
  ],
  providers: [
        AuthGuard,
        AuthenticationService,
        UserService,
        CertificateService,
        {provide: LocationStrategy, useClass: HashLocationStrategy}
      ],
  bootstrap: [AppComponent]
})
export class AppModule { }