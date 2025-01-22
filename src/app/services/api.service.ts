import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface QueryOptions {
  fields?: string[];
  populate?: string[] | Record<string, { fields: string[] }>;
  filters?: Record<string, any>;
  sort?: string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  page?: number;
  pageSize?: number;
}

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

  private buildQueryParams(options: QueryOptions): HttpParams {
    let params = new HttpParams();

    if (options.fields?.length) {
      params = params.set('fields', options.fields.join(','));
    }

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        params = params.set('populate', options.populate.join(','));
      } else {
        Object.entries(options.populate).forEach(([key, value]) => {
          params = params.set(`populate[${key}][fields]`, value.fields.join(','));
        });
      }
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        params = params.set(`filters[${key}]`, value);
      });
    }

    if (options.sort?.length) {
      params = params.set('sort', options.sort.join(','));
    }

    if (options.pagination) {
      if (options.pagination.page) {
        params = params.set('pagination[page]', options.pagination.page.toString());
      }
      if (options.pagination.pageSize) {
        params = params.set('pagination[pageSize]', options.pagination.pageSize.toString());
      }
    } else if (options.page) {
      params = params.set('pagination[page]', options.page.toString());
    } else if (options.pageSize) {
      params = params.set('pagination[pageSize]', options.pageSize.toString());
    }

    return params;
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

  getWithQuery(endpoint: string, options: QueryOptions = {}, token?: string): Observable<any> {
    const params = this.buildQueryParams(options);
    return this.http.get(`${this.apiUrl}${endpoint}`, {
      headers: this.createHeaders(token),
      params
    });
  }

  getDailyTip(): Observable<any> {
    return this.getWithQuery('/api/daily-tips', {
      fields: ['title', 'content', 'publishedAt']
    });
  }

  getMenuItems(): Observable<any> {
    return this.getWithQuery('/api/menucontrols', {
      fields: ['Title', 'link', 'documentId'],
      populate: {
        Parent: {
          fields: ['Title', 'link', 'documentId']
        }
      },
      sort: ['createdAt:desc']
    });
  }
}