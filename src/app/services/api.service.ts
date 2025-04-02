import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { APIEndpoints } from 'src/shared/endpoints';

interface QueryOptions {
  fields?: string[];
  populate?: string[] | Record<string, any>;
  filters?: Record<string, any>;
  sort?: string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  page?: number;
  pageSize?: number;
}

interface StateLaw {
  state: string;
  lawdescription: string;
  link: string;
}

interface StateLawsResponse {
  data: Array<{
    statelaws: StateLaw[];
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
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
        const handleNestedPopulate = (parentKey: string, value: any) => {
          if (typeof value === 'object') {
            if (value.fields) {
              params = params.set(`populate[${parentKey}][fields]`, value.fields.join(','));
            }
            if (value.populate) {
              Object.entries(value.populate).forEach(([nestedKey, nestedValue]: [string, any]) => {
                if (typeof nestedValue === 'object') {
                  // Handle fields at this level
                  if (nestedValue.fields) {
                    params = params.set(
                      `populate[${parentKey}][populate][${nestedKey}][fields]`,
                      nestedValue.fields.join(',')
                    );
                  }
                  // Recursively handle deeper populate
                  if (nestedValue.populate) {
                    Object.entries(nestedValue.populate).forEach(([deepKey, deepValue]: [string, any]) => {
                      if (deepValue.fields) {
                        params = params.set(
                          `populate[${parentKey}][populate][${nestedKey}][populate][${deepKey}][fields]`,
                          deepValue.fields.join(',')
                        );
                      }
                    });
                  }
                }
              });
            }
          }
        };

        Object.entries(options.populate).forEach(([key, value]) => {
          handleNestedPopulate(key, value);
        });
      }
    }
   
    // Keep existing functionality for filters, sort, and pagination
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
    return this.http.get(`${environment.apiHost}/${endpoint}`, { headers: this.createHeaders(token) });
  }

  post(endpoint: string, body: any, token?: string): Observable<any> {
    return this.http.post(`${environment.apiHost}/${endpoint}`, body, { headers: this.createHeaders(token) });
  }

  put(endpoint: string, body: any, token?: string): Observable<any> {
    return this.http.put(`${environment.apiHost}/${endpoint}`, body, { headers: this.createHeaders(token) });
  }

  patch(endpoint: string, body: any, token?: string): Observable<any> {
    return this.http.patch(`${environment.apiHost}/${endpoint}`, body, { headers: this.createHeaders(token) });
  }

  getWithQuery(endpoint: string, options: QueryOptions = {}, token?: string): Observable<any> {
    const params = this.buildQueryParams(options);
    let headers = this.createHeaders(token);
  
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  
    return this.http.get(endpoint, {
      headers,
      params
    });
  }

  getDailyTip(): Observable<any> {
    return this.getWithQuery(APIEndpoints.dailytip, {
      fields: ['title'],
      populate: {
        description: {
          fields: ['Description']
        }
      },
      sort: ['createdAt:desc']
    }, environment.apitoken);
  }

  getMenuItems(): Observable<any> {
    return this.getWithQuery(APIEndpoints.menu, {
      fields: ['title', 'link', 'documentId','order'],
      populate: {
        icon: {
          fields: ['url']
        },
        parentMenu: {
          fields: ['title', 'link', 'documentId','order'],
          populate: {
            icon: {
              fields: ['url']
            }
          }
        }
      },
      sort: ['createdAt:asc']
    }, environment.apitoken).pipe(
      map((res: any) => {
        if (res && res.data) {
          return res.data.map((item: any) => {
            if (item.icon && item.icon.url) {
              item.icon.url = `${environment.apiHost}${item.icon.url}`;
            }
            if (item.parentMenu && item.parentMenu.icon && item.parentMenu.icon.url) {
              item.parentMenu.icon.url = `${environment.apiHost}${item.parentMenu.icon.url}`;
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
    const endpoint = APIEndpoints.homebanner;
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
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
        map((res: any) => {
            console.log('data:', res.data);
            return res.data.map((resData: any) => {
                if (resData && resData.webImage && resData.webImage.url) {
                    resData.image = `${environment.apiHost}${resData.webImage.url}`;
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
    const endpoint = APIEndpoints.healthtips;
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
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res.data);
        return res.data.map((resData: any) => {
          if (resData && resData.webImage && resData.webImage.url) {
            resData.image = `${environment.apiHost}${resData.webImage.url}`;
          } else {
            resData.image = ''; 
          }
          return resData;
        },environment.apitoken);
      }),
      catchError(error => {
        console.error('Error fetching health tips', error);
        return throwError(error);
      })
    );
  }

  //Get expert advice
  getExpertAdvice(): Observable<any> {
    const endpoint = APIEndpoints.expertadvice;
    const options = {
        fields: ['title', 'description'],
        populate: {
            webImage: {
                fields: ['url']
            }
        },
        sort: ['createdAt:desc']
    };
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
        map((res: any) => {
            console.log('data:', res.data);
            return res.data.map((resData: any) => {
                if (resData && resData.webImage && resData.webImage.url) {
                    resData.image = `${environment.apiHost}${resData.webImage.url}`;
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

//Common slider service component
getSliders(endpoint: string, mainParam: string): Observable<any[]> {
  const options = {
    populate: {
      [mainParam]: {
        fields: ['title'],
        populate: {
          sliderContent: {
            fields: ['slidercontent'],
            populate: {
              webImage: {
                fields: ['url']
              }
            }
          }
        }
      }
    },
    sort: ['createdAt:desc']
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
      console.log('Raw API Response:', res.data);
      
      return res.data.map((resData: any) => {
        const sliderContent = resData[mainParam]?.sliderContent 
          ? resData[mainParam].sliderContent.map((content: any) => ({
              slidercontent: content.slidercontent || [],
              imageUrl: content.webImage?.url 
                ? `${environment.apiHost}${content.webImage.url}` 
                : null
            }))
          : [];

        return {
          [mainParam]: {
            title: resData[mainParam]?.title || '',
            sliderContent
          }
        };
      });
    }),
    catchError(error => {
      console.error(`Error fetching ${mainParam} sliders:`, error);
      return throwError(() => new Error(`Failed to fetch ${mainParam} sliders`));
    })
  );
}




  

  sendContactData(contactData: any): Observable<any> {
    const endpoint = APIEndpoints.contactus;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.apitoken}`
    });
  
    //const secretKey = '0244387ac5f95d2f5ae4b5e560e4c617f4b59857378d6579041229fdbb44dee9'; // Use a secure key, store it safely
    const secretKey = environment.secretKey; // Use a secure key, store it safely
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(contactData), secretKey).toString();
  
    return this.http.post(`${endpoint}`, { data: encryptedData }, { headers });
  }

    // Fetch Relational, which includes both personal and interpersonal items
    getRelationalContent(): Observable<any> {
      return this.getWithQuery(APIEndpoints.relations, {
        populate: 
        {
          Personal: {
            fields: ['textContent']
          },
          Interpersonal: {
            fields: ['textContent']
          }
        }
      }, environment.apitoken);
    }
  
  
  //Peace at home component service
  getPeaceAtHome(): Observable<any> {
    const endpoint = APIEndpoints.peaceathome;
    const options: QueryOptions = {
      populate: {
        webImage: { fields: ['url'] },
        mobileImage: { fields: ['url'] },
        ContentBlocks: { fields: ['multilinerichtextbox'] }
      }
    };

    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res);
        const resData = res.data;
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = `${environment.apiHost}${resData.webImage.url}`;
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


  //get healthy relationship data
  getHealthyRelationship(endpoint: string): Observable<any> {
    const options: QueryOptions = {
      populate: {
        webImage: { fields: ['url'] },
        mobileImage: { fields: ['url'] },
        contentBlocks: { fields: ['multilinerichtextbox'] }
      }
    };
  
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        console.log('data:', res);
        const resData = res.data;
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = `${environment.apiHost}${resData.webImage.url}`;
        } else {
          resData.image = ''; 
        }
        return resData;
      }),
      catchError(error => {
        console.error('Error fetching healthy relationship data', error);
        return throwError(error);
      })
    );
  }

  //Get healthy relationship content
  getHealthyRelationShipContent(endpoint: string): Observable<any> {
    return this.getWithQuery(endpoint, {
      fields: ['content']
    }, environment.apitoken).pipe(
      catchError((error: any) => {
        console.error('Error fetching Api content:', error);
        return throwError('An error occurred while fetching Api content. Please try again later.');
      })
    );
  }

//No Peaceathome partner violence
getNopeacepartnerViolence(): Observable<any> {
  return this.getWithQuery(APIEndpoints.nopeacepartnerviolence, {
    fields: ['content']
  }, environment.apitoken);
}


//No peace at home scneario once content
UnhealthyRelationshipContents(endPoint: string): Observable<any> {
  const options: QueryOptions = {
    populate: {
      Content: {
        populate: {
          webImage: { fields: ['url'] },
          mobileImage: { fields: ['url'] }
        }
      }
    },
    sort: ['createdAt:desc']
  };

  return this.getWithQuery(endPoint, options, environment.apitoken).pipe(
    map((res: any) => {
      const resData = res.data;
      if (resData[0] && resData[0]?.Content?.webImage?.url) {
        resData.image = `${environment.apiHost}${resData[0].Content.webImage.url}`;
      } else {
        resData.image = ''; 
      }
      return resData;
    }),
    catchError(error => {
      console.error('Error fetching data:', error);
      return throwError(() => new Error('Failed to fetch No Peace Home Scenario One'));
    })
  );
}

//Support Service api
getAllSupportServices(endpoint: string): Observable<any> {
  return this.getWithQuery(endpoint, {
    fields: [
      'OrgName',
      'PhoneNumber',
      'OrgWebUrl',
      'OrgAddress',
      'OrgCity',
      'OrgZipCode',
      'OrgHotline',
      'isCounseling',
      'isCommunityOutreach',
      'isReferralServices',
      'isShelter',
      'isCourtServices',
      'isOther',
      'isChildrenServices',
      'isSupportGroups',
      'isMedicalServices',
      'isBasicNeedsAssistance',
      'isSafetyPlanning',
      'isTranslationServices',
      'OrgLatitude',
      'OrgLongitude',
      'ServiceHours',
      'AboutOrg',
      'IsHotline'
    ],
    pagination: {
      page: 1,
      pageSize: 10000 
    }
  }, environment.apitoken).pipe(
    catchError((error: any) => {
      console.error('Error fetching support services:', error);
      return throwError('An error occurred while fetching support services. Please try again later.');
    })
  );
}

//Get support service filter options

getServiceFilterOptions(): Observable<any> {
  const endpoint = APIEndpoints.servicefilteroptions;
  const options: QueryOptions = {
    populate: {
      filterOptions: {
        fields: ['label', 'key', 'selected'] // Populate the fields of the FilterConstant component
      }
    }
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
      console.log('Service filter options data:', res);
      if (res.data && res.data.length > 0 && res.data[0] && res.data[0].filterOptions) {
        // Extract and flatten the filterOptions from res.data[0].attributes.filterOptions
        const filterOptions = res.data[0].filterOptions.map((item: any) => ({
          label: item.label,
          key: item.key,
          selected: item.selected
        }));
        return { data: filterOptions }; // Return just the filterOptions array for simplicity
      } else {
        return { data: [] }; // Return empty array if no data or structure is incorrect
      }
    }),
    catchError(error => {
      console.error('Error fetching service filter options:', error);
      return throwError(error);
    })
  );
}



getStateLaws(): Observable<StateLaw[]> {
  const endpoint = APIEndpoints.usstatelaws;

  const options: QueryOptions = {
    populate: {
      statelaws: {
        fields: ['state', 'lawdescription', 'link']
      }
    },
    pagination: {
      page: 1,
      pageSize: 10000
    }
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: StateLawsResponse) => {
      // Alternative to flatMap using reduce
      const allStateLaws = res.data?.reduce((acc, item) => {
        return acc.concat(item.statelaws ?? []);
      }, [] as StateLaw[]) ?? [];
      return allStateLaws;
    }),
    catchError(error => {
      console.error('Error fetching US state laws:', error);
      return throwError(() => new Error('Failed to fetch state laws'));
    })
  );
}


//Partner violence title content

//Peace at home component service
getPartnerViolenceTitle(): Observable<any> {
  const endpoint = APIEndpoints.partnervioencehome;
  const options: QueryOptions = {
    populate: {
      webImage: { fields: ['url'] },
      mobileImage: { fields: ['url'] },
      ContentBlocks: { fields: ['multilinerichtextbox'] }
    }
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
      console.log('data:', res);
      const resData = res.data;
      if (resData && resData.webImage && resData.webImage.url) {
        resData.image = `${environment.apiHost}${resData.webImage.url}`;
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

  //Common ipv partner violence service component
  getPartnerViolenceContent(): Observable<any> {
    return this.getWithQuery(
      APIEndpoints.ipvpartnervioence,
      {
        populate: ['ipvpartnerviolence'], // Pass as an array to get ?populate=ipvpartnerviolence
      },
      environment.apitoken
    ).pipe(
      catchError((error) => {
        console.error('Error fetching partner violence content:', error);
        const errorMessage =
          error.status === 0
            ? 'Network error: Please check your internet connection.'
            : error.status === 404
            ? 'Partner violence content not found.'
            : `Failed to fetch partner violence content: ${error.message || 'Unknown error'}`;
        return throwError(() => new Error(errorMessage));
      })
    );
  }


}






