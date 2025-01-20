import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:1337'; // Change this to your API URL

  constructor(private http: HttpClient) {}

  private createHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get(endpoint: string, token?: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { headers: this.createHeaders(token) });
  }

  post(endpoint: string, body: any, token?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, body, { headers: this.createHeaders(token) });
  }

  put(endpoint: string, body: any, token?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${endpoint}`, body, { headers: this.createHeaders(token) });
  }

  patch(endpoint: string, body: any, token?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${endpoint}`, body, { headers: this.createHeaders(token) });
  }

  getDailyTip(): Observable<any> {
    const endpoint = '/api/daily-tips';
    return this.http.get(`${this.apiUrl}${endpoint}`, {
      headers: this.createHeaders()
    });
  }
}