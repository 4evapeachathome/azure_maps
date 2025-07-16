import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzureMapsService {
  private baseUrl = 'https://atlas.microsoft.com/search/address/json';
  private subscriptionKey = 'BiKCkDXwHMOGze7XpZU6n9P9Zk0FxHzh2yBuNVOL40XZ2kUlXK4zJQQJ99BGACYeBjFYJtvcAAAgAZMPjlq3'; // 🔒 Replace with your key

  constructor(private http: HttpClient) {}

getGeocodeResult(query: string): Observable<any> {
  const params = new HttpParams()
    .set('api-version', '1.0')
    .set('query', query)
    .set('limit', '1')
    .set('countrySet', 'US')
    .set('language', 'en-US')
    .set('subscription-key', this.subscriptionKey);

  return this.http.get(this.baseUrl, { params });
}
  getPlacePredictions(query: string): Observable<any> {
    const params = new HttpParams()
      .set('api-version', '1.0')
      .set('typeahead', 'true')
      .set('query', query)
      .set('limit', '5')
      .set('countrySet', 'US')
      .set('language', 'en-US')
      .set('subscription-key', this.subscriptionKey);

    return this.http.get(this.baseUrl, { params });
  }
}
