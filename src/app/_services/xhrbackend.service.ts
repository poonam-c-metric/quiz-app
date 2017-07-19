/*
  Author : Poonam Gokani
  Desc   : Extended XHRBackend class to implement Response Interceptor (For redirecting unauthorized user to login page)
  Date   : 10/07/2017
 */

import {XHRBackend, Request, XHRConnection, Response, RequestOptions, ConnectionBackend} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Router } from '@angular/router';

export class MyXHRBackend extends XHRBackend {

  createConnection(request: Request): XHRConnection {
    let connection: XHRConnection = super.createConnection(request);
    // Before returning the connection we try to catch all possible errors(4XX,5XX and so on)
    connection.response = connection.response.catch(this.processResponse);
    return connection;
  }

  processResponse(response : Response){
    switch (response.status) {
      case 401:
        window.location.hash = 'login';
      case 403:
        console.log('Redirected to login');
      default:
        return Observable.throw(response);
    }
  }

}