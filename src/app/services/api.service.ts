import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

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
  private apitoken = '9d689662d625cea1c398e6cad3cf0e7387be9d29af8c6802fa837a034e38dd4b7dbcffd3afe7ba05903122e920bb1901570cd6b86c5004fd0e6f5c78837239797ffd42d4122299c1c3c6987c508c11c7a46ac0390223a9de7e5496d351d318dbe8a724dd383d42a0d859ab0a4b7e28816663e997c056924dc67ba5f32456b7d3';

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
    let headers = this.createHeaders(token);
  
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  
    return this.http.get(`${this.apiUrl}${endpoint}`, {
      headers,
      params
    });
  }

  getDailyTip(): Observable<any> {
    return this.getWithQuery('/api/daily-peace-tips', {
      fields: ['DailyPeaceTipsTitle'],
      populate: {
        HealthTipDescription: {
          fields: ['Description']
        }
      },
      sort: ['createdAt:desc']
    }, this.apitoken);
  }

  getMenuItems(): Observable<any> {
    return this.getWithQuery('/api/menucontrols', {
      fields: ['Title', 'link', 'documentId'],
      populate: {
        Parent: {
          fields: ['Title', 'link', 'documentId']
        }
      },
      sort: ['createdAt:asc']
    },this.apitoken);
  }

  //#region BannerSectionAPI Service 
  getHappyHomeQuote(): Observable<any> {
    const endpoint = '/api/home-banners?populate=*';
    return this.http.get(`${this.apiUrl}${endpoint}`, { headers: this.createHeaders(this.apitoken) }).pipe(
      map((res: any) => {
        debugger;
        console.log('data:', res.data);
        return res.data.map((resData: any) => {
          if (resData && resData.HomeBannerWebImage && resData.HomeBannerWebImage.url) {
            resData.image = `${this.apiUrl}${resData.HomeBannerWebImage.url}`;
          } else {
            resData.image = ''; 
          }
          return resData;
        });
      }),
      catchError(error => {
        console.error('Error fetching home quotes', error);
        return throwError(error);
      })
    );
  }
  //#endregion
  

  getWellnessTip(): Observable<any> {
    const endpoint = '/api/healthtips';
    const options = {
      fields: ['HealthTipsTitle', 'HealthTipsSubTitle'],
      populate: {
        HealthTipsDescription: {
          fields: ['Description']
        },
        HealthTipsWebImage: {
          fields: ['url'] 
        }
      },
      sort: ['createdAt:desc']
    };
    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res.data);
        return res.data.map((resData: any) => {
          if (resData && resData.HealthTipsWebImage && resData.HealthTipsWebImage.url) {
            resData.image = `${this.apiUrl}${resData.HealthTipsWebImage.url}`;
          } else {
            resData.image = ''; 
          }
          return resData;
        },this.apitoken);
      }),
      catchError(error => {
        console.error('Error fetching health tips', error);
        return throwError(error);
      })
    );
  }

  sendEmail(emailData: any): Observable<any> {
    return this.http.post(this.apiUrl, emailData);
  }

  sendContactData(contactData: any): Observable<any> {
    const endpoint = '/api/contacts'
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apitoken}` 
    });
    return this.http.post(`${this.apiUrl}${endpoint}`, { data: contactData }, { headers });
  }

  
  getPeaceAtHome(): Observable<any> {
    const endpoint = '/api/peaceathome';
    const options: QueryOptions = {
      populate: {
        PeaceathomeWebImage: { fields: ['url'] },
        PeaceathomeMobileImage: { fields: ['url'] },
        ContentBlock: { fields: ['multilinerichtextbox'] }
      }
    };

    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res);
        const resData = res.data;
        if (resData && resData.PeaceathomeWebImage && resData.PeaceathomeWebImage.url) {
          resData.image = `${this.apiUrl}${resData.PeaceathomeWebImage.url}`;
        } else {
          resData.image = ''; 
        }
        return resData;
      }),
      catchError(error => {
        console.error('Error fetching peace at home data', error);
        return throwError(error);
      })
    );
  }
}






