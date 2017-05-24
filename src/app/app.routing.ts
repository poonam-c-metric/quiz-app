import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { AuthGuard } from './_guards/index';
import { CertificateComponent } from './certificate/certificate.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';


const appRoutes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [AuthGuard]
     ,  children:[
        {
         	path : 'certificate',
         	component: CertificateComponent
        },
        {
             path : 'certificate/:certificate_id',
             component: CertificateComponent
        },
        {
            path : '',
            component: HomeComponent
        },
        {
         	path : 'teachers',
         	component: UserComponent
        }]
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);