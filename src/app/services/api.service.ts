import { Injectable, Query } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, tap, throwError } from 'rxjs';
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
          if (typeof value === 'object' && value !== null) {
            if (value.fields) {
              params = params.set(`populate[${parentKey}][fields]`, value.fields.join(','));
            }
            if (value.populate) {
              Object.entries(value.populate).forEach(([nestedKey, nestedValue]: [string, any]) => {
                if (nestedValue === true) {
                  // Handle simple `true` to populate the field
                  params = params.set(`populate[${parentKey}][populate][${nestedKey}]`, 'true');
                } else if (typeof nestedValue === 'object' && nestedValue !== null) {
                  if (nestedValue.fields) {
                    params = params.set(
                      `populate[${parentKey}][populate][${nestedKey}][fields]`,
                      nestedValue.fields.join(',')
                    );
                  }
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

  getWithQuery(endpoint: string, options: QueryOptions = {}, token?: string,extraHeaders?: HttpHeaders): Observable<any> {
    const params = this.buildQueryParams(options);
    let headers = this.createHeaders(token);
    if (extraHeaders) {
      extraHeaders.keys().forEach(key => {
        headers = headers.set(key, extraHeaders.get(key)!);
      });
    }
  
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  
    return this.http.get(endpoint, {
      headers,
      params
    });
  }

  getImageUrl(relativeUrl: string): string {
    return environment.apiHost.includes('localhost')
      ? `${environment.apiHost}${relativeUrl}`
      : relativeUrl;
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
      fields: ['title', 'link', 'documentId','order','tooltip'],
      populate: {
        icon: {
          fields: ['url']
        },
        parentMenu: {
          fields: ['title', 'link', 'documentId','order','tooltip'],
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
              item.icon.url = this.getImageUrl(item.icon.url);
            }
            if (item.parentMenu && item.parentMenu.icon && item.parentMenu.icon.url) {
              item.parentMenu.icon.url = this.getImageUrl(item.parentMenu.icon.url);
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
            return res.data.map((resData: any) => {
                if (resData && resData.webImage && resData.webImage.url) {
                    resData.image = this.getImageUrl(resData.webImage.url);
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
        return res.data.map((resData: any) => {
          if (resData && resData.webImage && resData.webImage.url) {
            resData.image = this.getImageUrl(resData.webImage.url);
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
            return res.data.map((resData: any) => {
                if (resData && resData.webImage && resData.webImage.url) {
                    resData.image = this.getImageUrl(resData.webImage.url);
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
       return res.data.map((resData: any) => {
        const sliderContent = resData[mainParam]?.sliderContent 
          ? resData[mainParam].sliderContent.map((content: any) => ({
              slidercontent: content.slidercontent || [],
              imageUrl: content.webImage?.url 
                ? this.getImageUrl(content.webImage.url)
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
        const resData = res.data;
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = this.getImageUrl(resData.webImage.url);
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
        const resData = res.data;
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = this.getImageUrl(resData.webImage.url);
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
        resData.image = this.getImageUrl(resData[0]?.Content?.webImage?.url);
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

//Get state distance
getSupportServiceDistances(): Observable<{ [key: string]: number }> {
  const endpoint = APIEndpoints.supportServiceDistances; 
  const options: QueryOptions = {
    fields: ['Abbreviation', 'Miles']
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        const distances: { [key: string]: number } = {};
        res.data.forEach((item: any) => {
          const abbreviation = item.attributes?.Abbreviation;
          const miles = parseInt(item.attributes?.Miles, 10); // Convert string to number
          if (abbreviation && !isNaN(miles)) {
            distances[abbreviation] = miles;
          }
        });
        return distances; // Return key-value object (e.g., { "AL": 50, "AK": 50, ... })
      } else {
        return {}; // Return empty object if no data or structure is incorrect
      }
    }),
    catchError(error => {
      console.error('Error fetching support service distances:', error);
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
      const resData = res.data;
      if (resData && resData.webImage && resData.webImage.url) {
        resData.image = this.getImageUrl(resData.webImage.url);
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

  //Types of abuses gallery
  getTypesOfAbuse(): Observable<any> {
    const endpoint = APIEndpoints.typesOfAbuse;
    const options = {
      populate: {
        AbuseGallery: {
          fields: ['caption'], // Ensure 'caption' is fetched
          populate: {
            webImage: { fields: ['url'] }, // Fetch only the 'url' field
            mobileImage: { fields: ['url'] }
          }
        }
      }
    };
  
  
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        const resData = res?.data;
        if (!resData) {
          console.warn('No data received from API');
          return null;
        }
  
        // Ensure AbuseGallery exists and process it
        if (resData.AbuseGallery && Array.isArray(resData.AbuseGallery)) {
          resData.AbuseGallery = resData.AbuseGallery.map((item: any) => ({
            ...item,
            webImageUrl: item.webImage?.url ? this.getImageUrl(item.webImage?.url) : '',
            mobileImageUrls: item.mobileImage?.map((img: any) => `${environment.apiHost}${img.url}`) || []
          }));
        } else {
          console.warn('AbuseGallery field is missing or not an array');
          resData.AbuseGallery = [];
        }
  
        return resData;
      }),
      catchError(error => {
        console.error('Error fetching types of abuse data:', error);
        return throwError(error);
      })
    );
  }
  
  getTypesofabusesTitle(): Observable<any> {
    const endpoint = APIEndpoints.typesofabusesTitle;
    const options: QueryOptions = {
      populate: {
        webImage: { fields: ['url'] },
        mobileImage: { fields: ['url'] }
      }
    };
  
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        const resData = res.data;
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = this.getImageUrl(resData.webImage.url)
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

  getPhysicalAbuses(endpoint:string,mainParam:string): Observable<any> {
    const options: QueryOptions = {
      populate: {
        [mainParam]: {
          populate: {
            example: true,
            webImage: { fields: ['url'] },
            mobileImage: { fields: ['url'] }
          }
        }
      }
    };
  
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      tap((res: any) => { }),
      map((res: any) => {
        const resData = res.data[0];
  
        if (resData && resData[mainParam]) {
          if (resData[mainParam].webImage && resData[mainParam].webImage.url) {
            resData[mainParam].webImage.fullUrl = this.getImageUrl(resData[mainParam].webImage.url);
          } else {
            resData[mainParam].webImage = { fullUrl: '' };
          }
  
          if (resData[mainParam].mobileImage && resData[mainParam].mobileImage.url) {
            resData[mainParam].mobileImage.fullUrl = `${environment.apiHost}${resData[mainParam].mobileImage.url}`;
          } else {
            resData[mainParam].mobileImage = { fullUrl: '' };
          }
        }
  
        return resData;
      }),
      catchError(error => {
        console.error('Error fetching physical abuses data', error);
        return throwError(error);
      })
    );
  }

  getunhealthyrelationexample(): Observable<any> {
    const endpoint = APIEndpoints.unhealthyrelationexamples; // '/api/unhealthyrelationexamples'
    const options : QueryOptions = {
      populate: ['content']
    }; 
    
    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        const resData = res.data[0];
        return resData;
      }),
      catchError(error => {
        console.error('Error fetching unhealthyrelationexamples API data', error);
        return throwError(error);
      })
    );
  }


  //getLegalRightsData
  getLegalRightsData(endpoint: string): Observable<any> {
    const options: QueryOptions = {
      populate: {
        webImage: { fields: ['url'] },
        mobileImage: { fields: ['url'] },
        contentBlocks: {
          populate: {
            webImage: { fields: ['url'] },
            mobileImage: { fields: ['url'] }
          }
        }
      }
    };

    return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
      map((res: any) => {
        const resData = res.data;
        
        // Handle top-level webImage
        if (resData && resData.webImage && resData.webImage.url) {
          resData.image = this.getImageUrl(resData.webImage.url)
        } else {
          resData.image = '';
        }

        // Handle contentBlocks webImage URLs
        if (resData && resData.contentBlocks && Array.isArray(resData.contentBlocks)) {
          resData.contentBlocks = resData.contentBlocks.map((block: any) => {
            if (block.webImage && block.webImage.url) {
              block.image = this.getImageUrl(block.webImage.url);
            } else {
              block.image = '';
            }
            return block;
          });
        }

        return resData;
      }),
      catchError(error => {
        console.error('Error fetching legal rights data', error);
        return throwError(error);
      })
    );
}


//criminilization of survivors
getCriminalizationOfSurvivors(): Observable<any> {
  const endpoint = APIEndpoints.criminalizationOfSurvivors; // e.g. '/api/criminizalationof-survivors'
  const options: QueryOptions = {
    populate: {
      webImage: { fields: ['url'] },
      mobileImage: { fields: ['url'] }
    }
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
      const resData = res.data?.[0];
    //  debugger;
      if (resData?.webImage?.length) {
        resData.imageList = resData.webImage.map((img: any) => ({
          ...img,
          fullUrl: this.getImageUrl(img.url)
        }));
      } else {
        resData.imageList = [];
      }

      return resData;
    }),
    catchError(error => {
      console.error('Error fetching criminalization of survivors API data', error);
      return throwError(error);
    })
  );
}

//get quiz api
getQuizzes(): Observable<any> {
  const endpoint = APIEndpoints.quiz;
  const options: QueryOptions = {
    populate: ['questions']  
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
      const quiz = res.data?.[0];
      if (!quiz) return null;
      const sortedQuestions = [...(quiz.questions || [])].sort((a, b) => a.id - b.id);
     // debugger;
      return {
        id: quiz.id,
        title: quiz.title,
        subheading: quiz.subheading,
        questions: sortedQuestions
      };
    }),
    catchError(error => {
      console.error('Error fetching quiz data', error);
      return throwError(error);
    })
  );
}


//get sripa api
// getSripaa(): Observable<any> {
//   const endpoint = APIEndpoints.sripa;
//   const options: QueryOptions = {
//     populate: {
//       sripa: {
//         fields: ['question', 'responseyes']
//       }
//     }
//   };

//   return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
//     map((res: any) => {
//       const item = res.data?.[0];
//       if (!item) return null;

//       return {
//         id: item.id,
//         title: item.title,
//         subheading: item.subheading,
//         rating: item.rating,
//         yesanswer: item.yesanswer,
//         sripa: item.sripa || []  // array of { question, responseyes }
//       };
//     }),
//     catchError(error => {
//       console.error('Error fetching sripaa data', error);
//       return throwError(error);
//     })
//   );
// }

getSripaa(): Observable<any> {
  const endpoint = APIEndpoints.ssripaQuestions; // Update to point to 'api/ssripa-questions'
  const options: QueryOptions = {
    fields: ['text','order'],
    populate: {
      severity: {
        fields: ['title']
      },
      actions: {
        fields: ['action']
      }
    }
  };

  return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
    map((res: any) => {
     // debugger;
      // Check if response has data
      if (!res.data || !Array.isArray(res.data)) {
        return [];
      }

      // Map each question to the desired format
      const mappedData = res.data.map((item: any) => ({
        id: item.id,
        text: item.text || '',
        order: item.order, // Include order in the mapped data for sorting
        severity: item.severity?.title || '',
        actions: item.actions?.map((act: any) => ({
          description: act.action || ''
        })) || []
      }));

      // Sort the mapped data by the order field
      return mappedData.sort((a:any, b:any) => a.order - b.order);

    }),
    catchError(error => {
      console.error('Error fetching ssripa-questions data', error);
      return throwError(error);
    })
  );
}


postSsripaAssessmentResponse(payload: any): Observable<any> {
  const endpoint = `${environment.apiHost}/api/ssripa-assessment-responses`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${environment.apitoken}`
  });
  // Strapi requires the payload inside a `data` key
  return this.http.post(endpoint, payload , { headers });
}

postHitsAssessmentResponse(payload: any): Observable<any> {
  const endpoint = APIEndpoints.saveHitsAssessment;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${environment.apitoken}`
  });
  // Strapi requires the payload inside a `data` key
  return this.http.post(endpoint, payload , { headers });
}

//Risk Assessment Module
// getUserLogins(): Observable<any[]> {
//   const endpoint = APIEndpoints.userLogins;
//   const options: QueryOptions = {
//     populate: {
//       assessment_type: {
//         fields: ['name', 'description','navigate']
//       },
//       support_service: {
//       fields: ['OrgName', 'documentId']
//       }
//     },
//     pagination: {
//       page: 1,
//       pageSize: 10000 
//     }
//   };

//   return this.getWithQuery(endpoint, options, environment.apitoken).pipe(
//     map((res: any) => {
//       if (!res.data || res.data.length === 0) return [];
//      // debugger;
//       const decryptField = (encryptedValue: any): string | null => {
//         if (!encryptedValue) return null;
//         try {
//           const bytes = CryptoJS.AES.decrypt(encryptedValue.toString().trim(), environment.secretKey);
//           const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//           return decrypted || encryptedValue;
//         } catch (error) {
//           console.warn('Decryption failed for:', encryptedValue, error);
//           return encryptedValue;
//         }
//       };
//       return res.data.map((item: any) => ({
//         id: item?.id ?? null,
//         username: item?.Username ? decryptField(item.Username) : '',
//         temp_password: item?.temp_password ? decryptField(item.temp_password) : '',
//         orgName: item?.support_service?.OrgName ?? 'N/A',
//         documentId: item?.support_service?.documentId ?? 'N/A',
//         assessment_type: item?.assessment_type ?? [],
//         createdAt: item?.createdAt ?? '',
//         IsPasswordChanged: item?.IsPasswordChanged ?? false,
//         updatedAt: item?.updatedAt ?? '',
//         password: item?.password ? decryptField(item.password) : '',
//         isSendInvite: item?.sendInvite ?? false,
//         AssessmentGuid: item.AssessmentGuid ?? '',
//         support_service: item?.support_service ?? {}
//       }));
//     }),
//     catchError((error) => {
//       console.error('Error fetching support_service data for user:', error);
//       return throwError(() => new Error('Failed to load support_service data.'));
//     })
//   );
// }

login(username: string, password: string): Observable<any> {
  const encryptedUsername = CryptoJS.AES.encrypt(username.trim(), environment.secretKey).toString();
  const encryptedPassword = CryptoJS.AES.encrypt(password.trim(), environment.secretKey).toString();
 
  const payload = {
    username: encryptedUsername,
    password: encryptedPassword,
  };

  return this.http.post(`${APIEndpoints.loginbyemail}`, payload).pipe(
    map((res: any) => {
      debugger;
      if (!res.data || res.data.length === 0) return null;
      const decrypt = (val: string) => {
        const bytes = CryptoJS.AES.decrypt(val, environment.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      };

      const user = res.data[0];
      return {
        id: user.id,
        documentId:user.documentId,
        username: decrypt(user.Username),
        password: decrypt(user.password),
        temp_password: decrypt(user.temp_password),
        support_service: user.support_service ?? {},
        assessment_type: user?.assessment_type ?? [],
        isSendInvite: user.sendInvite ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }),
    catchError((err) => {
      const errorMessage = err?.error?.error?.message || 'Login failed';
      return throwError(() => new Error(errorMessage));
    })
  );
}

 changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    // Encrypt all fields before sending
    const encryptedUsername = CryptoJS.AES.encrypt(username.trim(), environment.secretKey).toString();
    const encryptedPassword = CryptoJS.AES.encrypt(currentPassword.trim(), environment.secretKey).toString();
    const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword.trim(), environment.secretKey).toString();

    const payload = {
      username: encryptedUsername,
      password: encryptedPassword,
      newpassword: encryptedNewPassword,
    };

    return this.http.post(`${APIEndpoints.changePassword}`, payload).pipe(
      map((res: any) => {
        if (!res || !res.data) {
          throw new Error('Invalid response');
        }
        return res; // message and data like Username, updatedAt, IsPasswordChanged
      }),
      catchError((err) => {
        console.error('Change password failed:', err);
        const errorMessage =
          err?.error?.error?.message || // ✅ Correct path
          err?.error?.message ||        // fallback
          'Failed to update password';
      
        return throwError(() => new Error(errorMessage));
      })
    );
  }

//get user login by id
getUserLoginById(uid: number | string): Observable<any> {
  const endpoint = `${APIEndpoints.userLogins}/${uid}`;

  const noCacheHeaders = new HttpHeaders({
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  return this.getWithQuery(endpoint, {
    fields: [
      'Username',
      'password',
      'IsPasswordChanged',
      'sendInvite',
      'temp_password']}, environment.apitoken, noCacheHeaders).pipe(
    map((res: any) => {
      const item = res?.data;
      if (!item) return null;
     // debugger;
      const decryptField = (encryptedValue: any): string | null => {
        if (!encryptedValue) return null;

        try {
          const bytes = CryptoJS.AES.decrypt(encryptedValue.toString().trim(), environment.secretKey);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          return decrypted || encryptedValue;
        } catch (error) {
          console.warn('Decryption failed for:', encryptedValue, error);
          return encryptedValue;
        }
      };

      return {
        id: item?.id ?? null,
        username: item?.Username ? decryptField(item.Username) : '',
        temp_password: item?.temp_password ? decryptField(item.temp_password) : '',
        IsPasswordChanged: item?.IsPasswordChanged ?? false,
        password: item?.password ? decryptField(item.password) : '',
        isSendInvite: item?.sendInvite ?? false,
      };
    }),
    catchError((error) => {
      console.error('Error fetching user login by ID:', error);
      return throwError(() => new Error('Failed to load user login.'));
    })
  );
}


updateUserLogin(payload: any): Observable<any> {
  const endpoint = `${environment.apiHost}/api/user-logins/update-password`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${environment.apitoken}`
  });
  // Strapi requires the payload inside a `data` key
  return this.http.post(endpoint, payload , { headers });
}

forgetPassword(payload: any): Observable<any> {
  const endpoint = `${environment.apiHost}/api/user-logins/forgot-password`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${environment.apitoken}`
  });
  // Strapi requires the payload inside a `data` key
  return this.http.post(endpoint, payload , { headers });
}

//GetAssessmentType
getAssessmentType(docId:string): Observable<any> {
  return this.getWithQuery(`${APIEndpoints.userLogins}/${docId}`, {
    populate: {
      assessment_type: {
        fields: ['name', 'description','navigate']
      }
    }, 
    fields: ['documentId'] 
  }, environment.apitoken).pipe(
    catchError((error: any) => {
      console.error('Error fetching Hits result API:', error);
      return throwError(() => new Error('An error occurred while fetching Hits result API. Please try again later.'));
    })
  );
}


//Hits assessment
getHitsAssessmentQuestions(): Observable<any> {
  // Define the two endpoints
  const endpoint1 = APIEndpoints.hitsAssessmentQuestions; // Existing endpoint for questions
  const endpoint2 = APIEndpoints.scaleOptions; // New endpoint for answer options

  // Define query options for the first endpoint (questions)
  const options1: QueryOptions = {
    fields: ['question_text', 'weight_critical_alert','question_order'],
    populate: {
      multiple_answer_option: {
        fields: ['label', 'score']
      }
    }
  };

  // Define query options for the second endpoint (answer options)
  const options2: QueryOptions = {
    fields: ['label', 'score']
  };

  // Make the two API calls in parallel using forkJoin
  return forkJoin([
    this.getWithQuery(endpoint1, options1, environment.apitoken), // First API call (questions)
    this.getWithQuery(endpoint2, options2, environment.apitoken)  // Second API call (answer options)
  ]).pipe(
    map(([res1, res2]: [any, any]) => {
      // Process the first API response (questions)
      const questions = !res1.data || !Array.isArray(res1.data)
        ? []
        : res1.data.map((item: any) => ({
            id: item.id,
            documentId: item.documentId,
            question_text: item.question_text || '',
            weight_critical_alert: item.weight_critical_alert || false,
            question_order: item.question_order, // Include question_order for sorting
            multiple_answer_option: (item.multiple_answer_option || []).map((opt: any) => ({
              id: opt.id,
              documentId: opt.documentId,
              label: opt.label || '',
              score: opt.score ?? null
            }))
          }))
          .sort((a:any, b:any) => a.question_order - b.question_order);

      // Process the second API response (answer options)
      const answerOptions = !res2.data || !Array.isArray(res2.data)
        ? []
        : res2.data.map((item: any) => ({
            id: item.id,
            documentId: item.documentId,
            label: item.label || '',
            score: item.score ?? null
          }));

      // Combine the results into a single object
      return {
        questions,
        answerOptions
      };
    }),
    catchError(error => {
      console.error('Error fetching data from one or more endpoints', error);
      return throwError(error);
    })
  );
}

//getresultfor hits assessment
getHitsResultCalculation(): Observable<any> {
  return this.getWithQuery(APIEndpoints.hitsresultcalculation, {
    populate: {
      AnswerOption: {
        fields: ['color', 'min', 'max','label']
      }
    }, 
    fields: ['Note', 'Caution'] 
  }, environment.apitoken).pipe(
    catchError((error: any) => {
      console.error('Error fetching Hits result API:', error);
      return throwError(() => new Error('An error occurred while fetching Hits result API. Please try again later.'));
    })
  );
}

//Rats assessment
getRatsAssessmentQuestions(): Observable<any> {
  // Define the two endpoints
  const endpoint1 = APIEndpoints.ratsAssessmentQuestions; // Existing endpoint for questions
  const endpoint2 = APIEndpoints.ratScaleOptions; // New endpoint for answer options

  // Define query options for the first endpoint (questions)
  const options1: QueryOptions = {
    fields: [], //'question_text', 'multiple_options_for_rat' or weight_critical_alert
    populate: {
      multiple_options_for_rat: {
        fields: ['Label', 'score'] //'Label', 'score'
      }
    }
  };

  // Define query options for the second endpoint (answer options)
  const options2: QueryOptions = {
    fields: ['Label', 'score'] // 'Label', 'score'
  };

  // Make the two API calls in parallel using forkJoin
  return forkJoin([
    this.getWithQuery(endpoint1, options1, environment.apitoken), // First API call (questions)
    this.getWithQuery(endpoint2, options2, environment.apitoken)  // Second API call (answer options)
  ]).pipe(
    map(([res1, res2]: [any, any]) => {
      // Process the first API response (questions)
      const questions = !res1.data || !Array.isArray(res1.data)
        ? []
        : res1.data.map((item: any) => ({
            id: item.id,
            documentId: item.documentId,
            question_text: item.question_text || '',
            // weight_critical_alert: item.weight_critical_alert || false,
            multiple_options_for_rat: (item.multiple_options_for_rat || []).map((opt: any) => ({
              id: opt.id,
              documentId: opt.documentId,
              Label: opt.Label || '',
              score: opt.score ?? null
            })),
            questionOrder: item.questionOrder
          }));

      // Process the second API response (answer options)

      const answerOptions = !res2.data || !Array.isArray(res2.data)
        ? []
        : res2.data.map((item: any) => ({
            id: item.id,
            documentId: item.documentId,
            Label: item.Label || '',
            score: item.score ?? null
          }));

      // Combine the results into a single object
      return {
        questions,
        answerOptions
      };
    }),
    catchError(error => {
      console.error('Error fetching data from one or more endpoints', error);
      return throwError(error);
    })
  );
}

  getRatsResultCalculation(): Observable<any> {
    return this.getWithQuery(APIEndpoints.ratResultCalculation, {
      fields: ['Note', 'Caution']
    }, environment.apitoken).pipe(
      catchError((error: any) => {
        console.error('Error fetching Hits result API:', error);
        return throwError(() => new Error('An error occurred while fetching Hits result API. Please try again later.'));
      })
    );
  }

  saveRatAssessment(assessmentSummary: any, support_service: string, AssessmentGuid: string, assessmentScore: number, caseNumber: string, guidedType: string, qrCodeUrl: string) {
    const endpoint = APIEndpoints.saveRatAssessment;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.apitoken}`
    });
    // Strapi requires the payload inside a `data` key
    // return this.http.post(endpoint, payload , { headers });
    return this.http.post(`${endpoint}`, { data: {assessmentSummary, support_service, AssessmentGuid, assessmentScore, caseNumber, guidedType, qrCodeUrl} }, { headers });
  }

  getRatsResult(code: any): Observable<any> {
    return this.http.get(APIEndpoints.ratResult + code, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.apitoken}`
      })
    }).pipe(
      map((res: any) => {
        if (res.data) {
          const result = res.data;
          return result;
        } else {
          return null; // No results found
        }
      }),
      catchError((error: any) => {
        console.error('Error fetching web Assessment Response API:', error);
    
      // Extract message from backend response
      const backendMessage =
        error?.error?.error?.message || // Strapi v4/v5 structure
        error?.error?.message ||        // Some other possible nesting
        'An error occurred while fetching the Qrcode';
    
      return throwError(() => new Error(backendMessage));
      })
    );

  }

  // DA assessment
  getDAAssessmentQuestions(): Observable<any> {
    return this.getWithQuery(APIEndpoints.daAssessmentQuestions, {
      populate: {
        DAChild: {
          fields: ['questionText', 'weightageScore', 'questionOrder']
        }
      },
      fields: ['questionText', 'score', 'weightage_score', 'questionOrder']
    }, environment.apitoken).pipe(
      catchError((error: any) => {
        console.error('Error fetching DA Assessment Questions API:', error);
        return throwError(() => new Error('An error occurred while fetching DA Assessment Questions API. Please try again later.'));
      })
    );
  }



getDAresultcalculation(): Observable<any> {
  return this.getWithQuery(APIEndpoints.daAssessmentResult, {
    fields: ['color', 'min', 'max','label']
  }, environment.apitoken).pipe(
    catchError((error: any) => {
      console.error('Error fetching Hits result API:', error);
      return throwError(() => new Error('An error occurred while fetching Hits result API. Please try again later.'));
    })
  );
}

generateGuid(url:string): Observable<any> {
  return this.http.get(url, {
    headers: {
      Authorization: `Bearer ${environment.apitoken}`
    }
  }).pipe(
    catchError((error: any) => {
      console.error('Error fetching HITS GUID:', error);
      return throwError(() => new Error('An error occurred while generating HITS GUID. Please try again later.'));
    })
  );
}

saveDaAssessmentResponse(payload: any): Observable<any> {
  const endpoint = APIEndpoints.daAssessmentResponse;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${environment.apitoken}`
  });
  // Strapi requires the payload inside a `data` key
  return this.http.post(endpoint, payload , { headers });
}

//get assessment results using assessment id
getAssessmentResponse(url: string): Observable<any> {
  return this.getWithQuery(url, {
    populate: {
      support_service: {
        fields: ['documentId'],
        populate: {
          user_login: {
            fields: ['username'],
            populate: {
              assessment_type: {
                fields: ['name', 'description']
              }
            }
          }
        }
      }
    },
    fields: [
      'id',
      'documentId',
      'AssessmentGuid',
      'response',
      'CaseNumber',
      'Score'
    ]
  }, environment.apitoken).pipe(
    tap((response: any) => {
    }),
    catchError((error: any) => {
      console.error('Error fetching Assessment Response API:', error);
    
      // Extract message from backend response
      const backendMessage =
        error?.error?.error?.message || // Strapi v4/v5 structure
        error?.error?.message ||        // Some other possible nesting
        'An error occurred while fetching the Qrcode';
    
      return throwError(() => new Error(backendMessage));
    })
  );
}


}
