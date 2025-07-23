import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, Observable, switchMap, take } from 'rxjs';
import { MenuService } from 'src/shared/menu.service';

@Injectable({
  providedIn: 'root'
})
export class AzureMapsService {
  private baseUrl = 'https://atlas.microsoft.com/search/address/json';
  private azureKey: any;
  private azureKeySubject = new BehaviorSubject<string | null>(null);
  constructor(private http: HttpClient, private sharedDataService: MenuService) { 
   this.sharedDataService.dataLoaded$.pipe(
    filter(ready => ready),
    take(1)
  ).subscribe(async () => {
    const configMap = await firstValueFrom(this.sharedDataService.config$);
    this.azureKey = configMap['azureMapsKey'];
    this.azureKeySubject.next(this.azureKey);
  });
  }

private waitForKey(): Observable<string> {
  return this.azureKeySubject.pipe(
    filter((key): key is string => !!key), 
    take(1)
  );
}

getGeocodeResult(query: string): Observable<any> {
  return this.waitForKey().pipe(
    switchMap(key => {
      const params = new HttpParams()
        .set('api-version', '1.0')
        .set('query', query)
        .set('limit', '1')
        .set('countrySet', 'US')
        .set('language', 'en-US')
        .set('subscription-key', key);
      return this.http.get(this.baseUrl, { params });
    })
  );
}
}
