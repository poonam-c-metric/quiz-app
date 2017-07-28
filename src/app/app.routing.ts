import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { AuthGuard } from './_guards/index';
import { CertificateComponent } from './certificate/certificate.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { ContentComponent } from './content/content.component';
import { MainmenuComponent } from './mainmenu/mainmenu.component';
import { ReportComponent } from './report/report.component';
import { PreviewComponent } from './preview/preview.component';
import { CommunityComponent } from './community/community.component';
import { PublishComponent } from './publish/publish.component';
import { QuestionComponent } from './question/question.component';
import { StudentComponent } from './student/student.component';
import { AddstudentComponent } from './addstudent/addstudent.component';
import { ContentAddComponent } from './content/content-add/content-add.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AddQuestionComponent } from './question/add-question/add-question.component';
import { ExaminationComponent } from './examination/examination.component';
import { StudentloginComponent } from './studentlogin/studentlogin.component';
import { StudentdashboardComponent } from './studentdashboard/studentdashboard.component';
import { StudentprofileComponent } from './studentprofile/studentprofile.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { StudentpasswordComponent } from './studentpassword/studentpassword.component';

const appRoutes: Routes = [
    { path: '',  component: DashboardComponent, canActivate: [AuthGuard]
     ,  children:[
        {
         	path : 'certificate/insert',
         	component: CertificateComponent
        },
        {
            path : 'certificate/update/:certificate_id',
            component: CertificateComponent
        },
        {
            path : 'certificate/update',
            component: CertificateComponent
        },
        {
            path : '',
            component: HomeComponent
        },
        {
            path : 'dashboard',
            component: HomeComponent
        },
        {
         	path : 'teachers',
         	component: UserComponent
        },
        {
            path : 'content',
            component: ContentComponent
        },
        {
             path : 'content/insert',
             component: ContentAddComponent
        },
        {
            path : 'content/edit/:content_id',
            component: ContentAddComponent
        },
        {
            path : 'mainmenu/:certificate_id',
            component: MainmenuComponent
        },
        {
            path : 'report',
            component: ReportComponent
        },
        {
            path : 'previewtest',
            component: PreviewComponent
        },
        {
            path : 'community',
            component: CommunityComponent
        },
        {
            path : 'publish',
            component: PublishComponent
        },
        {
            path : 'questions/insert',
            component: AddQuestionComponent
        },
        {
            path : 'questions/update/:question_id',
            component: AddQuestionComponent
        },
        {
            path : 'questions/:content_id',
            component: QuestionComponent
        },
        {
            path : 'questions',
            component: QuestionComponent
        },
        {
            path : 'students',
            component: StudentComponent
        },
        {
            path : 'students/add',
            component: AddstudentComponent
        },
        {
            path : 'students/edit/:student_id',
            component: AddstudentComponent
        },
        {
            path : 'students/delete/:student_del_id',
            component: StudentComponent
        },
        {
            path : 'changepassword',
            component: ChangePasswordComponent
        }]
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'resetPassword', component: ResetPasswordComponent },
    { path: 'online-exam', component: StudentloginComponent },
    { path: 'student', component: StudentdashboardComponent ,
        children: [{
            path : 'dashboard', component: StudenthomeComponent
        },{
            path : 'updateprofile', component: StudentprofileComponent
        },{
            path : 'changepassword', component: StudentpasswordComponent
        },{
            path: 'examination/:content_id', component: ExaminationComponent
        }]
    },
    //{ path : 'student/updateprofile', component: StudentprofileComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);