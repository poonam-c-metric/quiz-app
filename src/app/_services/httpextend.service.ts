/*
  Author : Poonam Gokani
  Desc   : To add authorization header in every http request
  Date   : 10/07/2017
 */

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, BaseRequestOptions , RequestOptionsArgs , XHRBackend } from '@angular/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {
  headers = new Headers({
    'Accept': 'application/json',
  });

  merge(options?: RequestOptionsArgs): RequestOptions {
    var newOptions = super.merge(options);
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser == null)
      currentUser = JSON.parse(localStorage.getItem('currentStudent'));
    if(currentUser!=null){
    	newOptions.headers.set('Authorization', currentUser.accessToken);
	  }
    return newOptions;
  }
}