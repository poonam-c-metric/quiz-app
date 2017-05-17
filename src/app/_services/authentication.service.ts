import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    constructor(private http: Http ) { }

    login(username: string, password: string) {
        return this.http.post('/api/loginUser',{ username: username, password: password })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let data = response.json();
                if (data.user && data.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                }
            });
    }

    logout() {
        // remove user from local storage to log user out
        console.log('Inside Logout User');
        localStorage.removeItem('currentUser');
        return this.http.get('/api/logoutUser')
            .map((response: Response) => {
                return response.json();
        });
    }
}