import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoggingService } from './logging.service';

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

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'  
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService
  ) {
    this.loggingService.setConfig(environment.logging);
  }

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

  private logApiCall(method: string, endpoint: string, response: any) {
    this.loggingService.logActivity({
      dateTime: new Date().toISOString(),
      requestedBy: 'user', // You can replace this with actual user info from your auth service
      activityType: `${method} ${endpoint}`,
      response: JSON.stringify(response)
    });
  }

  get<T>(endpoint: string, token?: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers: this.createHeaders(token) }).pipe(
      tap(response => this.logApiCall('GET', endpoint, response))
    );
  }

  post<T>(endpoint: string, body: any, token?: string): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.createHeaders(token) }).pipe(
      tap(response => this.logApiCall('POST', endpoint, response))
    );
  }

  put<T>(endpoint: string, body: any, token?: string): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.createHeaders(token) }).pipe(
      tap(response => this.logApiCall('PUT', endpoint, response))
    );
  }

  patch<T>(endpoint: string, body: any, token?: string): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.createHeaders(token) }).pipe(
      tap(response => this.logApiCall('PATCH', endpoint, response))
    );
  }

  getWithQuery<T>(endpoint: string, options: QueryOptions = {}, token?: string): Observable<T> {
    const params = this.buildQueryParams(options);
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.createHeaders(token),
      params
    }).pipe(
      tap(response => this.logApiCall('GET', endpoint, response))
    );
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