import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http:HttpClient) {
  
  }
  loginUrl = 'https://ai.ultimatetek.in:8998/agent/aiwksp/db_query/subscription_chk_v1';

  login(req:any){
     return this.http.post(this.loginUrl, req,{observe:'body'});
  }

}