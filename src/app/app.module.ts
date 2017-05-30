import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Directive } from '@angular/core';
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
import { RecaptchaModule } from 'ng-recaptcha';

import { CustomFormsModule } from '../../node_modules/ng2-validation/dist/index';
import { ToastyModule } from 'ng2-toasty';
import { ModalModule } from "ngx-modal";
import { CertificateComponent } from './certificate/certificate.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UserComponent } from './user/user.component';
import { UiSwitchModule } from 'ngx-ui-switch/src';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';
import { ContentComponent } from './content/content.component';
import { DataTableModule } from "angular2-datatable";
import { MainmenuComponent } from './mainmenu/mainmenu.component';
import { ReportComponent } from './report/report.component';
import { PreviewComponent } from './preview/preview.component';
import { CommunityComponent } from './community/community.component';
import { PublishComponent } from './publish/publish.component';
import { QuestionComponent } from './question/question.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CertificateComponent,
    HomeComponent,
    NavbarComponent,
    UserComponent,
    FileSelectDirective,
    ContentComponent,
    MainmenuComponent,
    ReportComponent,
    PreviewComponent,
    CommunityComponent,
    PublishComponent,
    QuestionComponent
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
    DataTableModule,
    ToastyModule.forRoot(),
    RecaptchaModule.forRoot()
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