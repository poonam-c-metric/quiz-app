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

const appRoutes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [AuthGuard]
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
            path : '',
            component: HomeComponent
        },
        {
         	path : 'teachers',
         	component: UserComponent
        },
        {
            path : 'section',
            component: ContentComponent
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
        },{
            path : 'question',
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
        }]
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);