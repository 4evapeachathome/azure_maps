import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

interface QueryOptions {
  fields?: string[];
  populate?: string[] | Record<string, { fields: string[], populate?: Record<string, { fields: string[] }> }>;
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
          if (typeof value === 'object' && value.fields) {
            params = params.set(`populate[${key}][fields]`, value.fields.join(','));
          }
          if (typeof value === 'object' && 'populate' in value) {
            Object.entries(value.populate as Record<string, { fields: string[] }>).forEach(([nestedKey, nestedValue]) => {
              params = params.set(`populate[${key}][populate][${nestedKey}][fields]`, nestedValue.fields.join(','));
            });
          }
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
      fields: ['title'],
      populate: {
        description: {
          fields: ['Description']
        }
      },
      sort: ['createdAt:desc']
    }, this.apitoken);
  }

  getMenuItems(): Observable<any> {
    return this.getWithQuery('/api/menucontrols', {
      fields: ['title', 'link', 'documentId'],
      populate: {
        icon: {
          fields: ['url']
        },
        parentMenu: {
          fields: ['title', 'link', 'documentId'],
          populate: {
            icon: {
              fields: ['url']
            }
          }
        }
      },
      sort: ['createdAt:asc']
    }, this.apitoken).pipe(
      map((res: any) => {
        if (res && res.data) {
          return res.data.map((item: any) => {
            if (item.icon && item.icon.url) {
              item.icon.url = `${this.apiUrl}${item.icon.url}`;
            }
            if (item.parentMenu && item.parentMenu.icon && item.parentMenu.icon.url) {
              item.parentMenu.icon.url = `${this.apiUrl}${item.parentMenu.icon.url}`;
            }
            return item;
          });
        } else {
          console.error('Invalid API response:', res);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching menu items', error);
        return throwError(error);
      })
    );
  }


  //#region BannerSectionAPI Service 
  getHappyHomeQuote(): Observable<any> {
    const endpoint = '/api/home-banners';
    const options = {
        populate: {
            content: {
                fields: ['*']
            },
            webImage: {
                fields: ['url']
            }
        },
        sort: ['createdAt:desc']
    };
    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
        map((res: any) => {
            console.log('data:', res.data);
            return res.data.map((resData: any) => {
                if (resData && resData.webImage && resData.webImage.url) {
                    resData.image = `${this.apiUrl}${resData.webImage.url}`;
                } else {
                    resData.image = '';
                }
                return resData;
            });
        }),
        catchError(error => {
            console.error('Error fetching home banners', error);
            return throwError(error);
        })
    );
}
  //#endregion
  
  getWellnessTip(): Observable<any> {
    const endpoint = '/api/healthtips';
    const options = {
      fields: ['title', 'subtitle'],
      populate: {
        description: {
          fields: ['Description']
        },
        webImage: {
          fields: ['url'] 
        }
      },
      sort: ['createdAt:desc']
    };
    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res.data);
        return res.data.map((resData: any) => {
          if (resData && resData.webImage && resData.webImage.url) {
            resData.image = `${this.apiUrl}${resData.webImage.url}`;
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

  //Get expert advice
  getExpertAdvice(): Observable<any> {
    const endpoint = '/api/expert-advices';
    const options = {
        fields: ['title', 'description'],
        populate: {
            webImage: {
                fields: ['url']
            }
        },
        sort: ['createdAt:desc']
    };
    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
        map((res: any) => {
            console.log('data:', res.data);
            return res.data.map((resData: any) => {
                if (resData && resData.webImage && resData.webImage.url) {
                    resData.image = `${this.apiUrl}${resData.webImage.url}`;
                } else {
                    resData.image = '';
                }
                return resData;
            });
        }),
        catchError(error => {
            console.error('Error fetching expert advice', error);
            return throwError(error);
        })
    );
}

//Home slider component api method

  getHomeSliders(): Observable<any> {
    const endpoint = '/api/home-sliders';
    const options = {
      populate: {
        homeslider: {
          fields: ['*'],
          populate: {
            description: {
              fields: ['*']
            },
            webImage: {
              fields: ['url']
            }
          }
        }
      },
      sort: ['createdAt:desc']
    };
    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res.data);
        return res.data.map((resData: any) => {
          if (resData.homeslider && resData.homeslider.webImage && resData.homeslider.webImage.url) {
            resData.image = `${this.apiUrl}${resData.homeslider.webImage.url}`;
          } else {
            resData.image = '';
          }
          return resData;
        });
      }),
      catchError(error => {
        console.error('Error fetching home sliders', error);
        return throwError(error);
      })
    );
  }

  sendContactData(contactData: any): Observable<any> {
    const endpoint = '/api/contacts'
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apitoken}` 
    });
    return this.http.post(`${this.apiUrl}${endpoint}`, { data: contactData }, { headers });
  }

    // Fetch Relational, which includes both personal and interpersonal items
    getRelationalContent(): Observable<any> {
      return this.getWithQuery('/api/relationals', {
        populate: 
        {
          Personal: {
            fields: ['textContent']
          },
          Interpersonal: {
            fields: ['textContent']
          }
        }
      }, this.apitoken);
    }
  
  //Home slider api service method
  getHomeSliderData(): Observable<any> {
    const endpoint = '/api/home-sliders';
    const options: QueryOptions = {
      populate: {
        homeslider: {
          fields: ['title'],
          populate: {
            webImage: { fields: ['url'] },
            description: {
              fields: ['multilineRichTextBox']
            }
          }
        }
      }
    };

    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res);
        const resData = res.data;
        if (resData && resData.homeslider && resData.homeslider.webImage && resData.homeslider.webImage.url) {
          resData.homeslider.image = `${this.apiUrl}${resData.homeslider.webImage.url}`;
        } else {
          resData.homeslider.image = ''; 
        }
        return resData;
      }),
      catchError(error => {
        console.error('Error fetching home slider data', error);
        return throwError(error);
      })
    );
}

  //Peace at home component service
  getPeaceAtHome(): Observable<any> {
    const endpoint = '/api/peaceathome';
    const options: QueryOptions = {
      populate: {
        webImage: { fields: ['url'] },
        mobileImage: { fields: ['url'] },
        ContentBlocks: { fields: ['multilinerichtextbox'] }
      }
    };

    return this.getWithQuery(endpoint, options, this.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res);
        const resData = res.data;
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = `${this.apiUrl}${resData.webImage.url}`;
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






