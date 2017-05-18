import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router} from '@angular/router';
import { User } from '../_models/index';

@Injectable()
export class UserService {
    constructor(private http: Http , private router: Router) { }

    create(user: User) {
        return this.http.post('/api/registerUser', user, this.jwt())
        .map((response: Response) => {
            let data = response.json();
            return data;
        });
    }

    makeUserActive( userId : String , accessToken : String){
        return this.http.put('/api/activeUser',{ userId: userId, accessToken: accessToken })
            .map((response: Response) => {
                let data = response.json();
                if(data.affectedRows && data.affectedRows>0 && localStorage.getItem('currentUser')){
                    this.router.navigate(['/']);
                }else if(data.affectedRows && data.affectedRows>0){
                    this.router.navigate(['/login']);
                }else{
                    this.router.navigate(['/login']);
                }
            }).subscribe();
    }

    resetPassword( emailId : String){
        console.log('In UserService:'+emailId) ;
        return this.http.post('/api/resetPassword',{ emailId: emailId})
            .map((response: Response) => {
                let data = response.json();
                console.log("Mail send successfully");
                return data;
            })
    }

    updateUserData(userdetails : Object){
        return this.http.put('/api/updateUser',{ userdata: userdetails })
            .map((response: Response) => {
                let data = response.json();
                return data;
            })
    }

    // private helper methods
    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
}