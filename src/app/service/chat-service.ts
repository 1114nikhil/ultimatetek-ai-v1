import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private url = 'https://ai.ultimatetek.in:8077/dbquery/generate/insights';

  constructor(private http: HttpClient) {}

 getData(payload: any) {
  return this.http.post(this.url, payload, { responseType: 'text' });
}
}
