import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Directive } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule , RequestOptions , XHRBackend } from '@angular/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarModule } from './sidebar/sidebar.module';

import { AuthGuard , StudentAuthGuard } from './_guards/index';
import { AuthenticationService, UserService, CertificateService, StudentService, DataFilterPipe, ContentService, QuestionService, DefaultRequestOptions, MyXHRBackend, StudentModuleService, PublishService, ReportService } from './_services/index';

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
import { StudentComponent } from './student/student.component';
import { AddstudentComponent } from './addstudent/addstudent.component';
import { ContentAddComponent } from './content/content-add/content-add.component';
import { TrimValueAccessorModule } from 'ng-trim-value-accessor';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AddQuestionComponent } from './question/add-question/add-question.component';
import { DropdownModule } from "ng2-dropdown";
import { NgDragDropModule } from 'ng-drag-drop';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ExaminationComponent } from './examination/examination.component';
import { StudentloginComponent } from './studentlogin/studentlogin.component';
import { StudentdashboardComponent } from './studentdashboard/studentdashboard.component';
import { StudentprofileComponent } from './studentprofile/studentprofile.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { StudentpasswordComponent } from './studentpassword/studentpassword.component';
import { StudentResetPasswordComponent } from './student-reset-password/student-reset-password.component';
import { DaterangepickerModule } from 'angular-2-daterangepicker';

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
    QuestionComponent,
    StudentComponent,
    AddstudentComponent,
    ContentAddComponent,
    DataFilterPipe,
    ResetPasswordComponent,
    ChangePasswordComponent,
    AddQuestionComponent,
    ExaminationComponent,
    StudentloginComponent,
    StudentdashboardComponent,
    StudentprofileComponent,
    StudenthomeComponent,
    StudentpasswordComponent,
    StudentResetPasswordComponent
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
    TrimValueAccessorModule,
    DropdownModule,
     NgDragDropModule.forRoot(),
    ToastyModule.forRoot(),
    RecaptchaModule.forRoot(),
    TimepickerModule.forRoot(),
    DaterangepickerModule
  ],
  providers: [
    AuthGuard,
    StudentAuthGuard,
    AuthenticationService,
    UserService,
    CertificateService,
    StudentService,
    ContentService,
    QuestionService,
    StudentModuleService,
    PublishService,
    ReportService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: RequestOptions, useClass: DefaultRequestOptions },
    { provide: XHRBackend, useClass: MyXHRBackend }
   ],
    bootstrap: [AppComponent]
})

export class AppModule { }