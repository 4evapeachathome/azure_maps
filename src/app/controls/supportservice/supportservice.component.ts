import { AzureMapsService } from './service/azure-maps.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { IonicModule, Platform, ToastController } from '@ionic/angular';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { AppLauncher, CanOpenURLResult } from '@capacitor/app-launcher';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, firstValueFrom, take } from 'rxjs';
import { DEFAULT_DISTANCE, STATE_ABBREVIATIONS, STATE_NAME_TO_DISTANCE } from 'src/shared/usstateconstants';
import { MenuService } from 'src/shared/menu.service';
import { GoogleApiRateLimiterService } from 'src/shared/google-api-rate-limiter.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PageTitleService } from 'src/app/services/page-title.service';

declare var google: any;

export interface OrganizationResponse {
  data: Organization[];
  meta: Meta;
}

export interface Organization {
  id: number;
  documentId: string;
  OrgName: string;
  PhoneNumber: string;
  OrgWebUrl: string;
  OrgAddress: string;
  OrgCity: string;
  OrgZipCode: string;
  OrgHotline: string;
  OrgLatitude: string;
  OrgLongitude: string;
  ServiceHours: string;
  AboutOrg: AboutOrgItem[];
  IsHotline: boolean | null;
  
  // Service flags
  isCounseling: boolean;
  isCommunityOutreach: boolean;
  isReferralServices: boolean;
  isShelter: boolean;
  isCourtServices: boolean;
  isOther: boolean;
  isChildrenServices: boolean;
  isSupportGroups: boolean;
  isMedicalServices: boolean;
  isBasicNeedsAssistance: boolean;
  isSafetyPlanning: boolean;
  isTranslationServices: boolean;
}

export interface AboutOrgItem {
  type: string;
  children: AboutOrgChild[];
}

export interface AboutOrgChild {
  text: string;
  type: string;
  bold?: boolean;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface FilterOption {
  label: string;
  key: string;
  selected: boolean;
}

interface Place {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  formatted_address: string;
}

@Component({
  selector: 'pathome-supportservice',
  templateUrl: './supportservice.component.html',
  styleUrls: ['./supportservice.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, GoogleMapsModule, FormsModule, BreadcrumbComponent],
})
export class SupportserviceComponent  implements OnInit{
  searchQuery: string = '';
  filterOpen: boolean = false;
  locationcard: boolean = false;
  selectedLocation: Organization | null = null;
  activeTab: string = 'about';
  segment: string = 'about';
  latitude: number | undefined;
  longitude: number | undefined;
  geolocationEnabled: boolean = false;
  userLocation: any = null;
  organizations: Organization[] = [];
  filterOptions: FilterOption[] = [];
  filteredlocationwithinradius: any[] = [];
  autocompleteService: any;
  placesService: any;
  autocompleteItems: Place[] = [];
  searchSubject = new BehaviorSubject<string>('');
  @ViewChild(GoogleMap) map!: GoogleMap;
  searchedLocationMarker: any = null;
  supportServiceMarkers: any[] = [];
  currentState: string = '';
  searchRadius: number = DEFAULT_DISTANCE;
  firstLoad: boolean = true;
  private searchCache = new Map<string, Place[]>();
  googleMapsReady = false;
  


  constructor(private azureMapsService:AzureMapsService,private rateLimiter: GoogleApiRateLimiterService,private http:HttpClient,private platform: Platform,private toastController: ToastController, private sharedDataService: MenuService, private ngZone: NgZone,private sharedService:PageTitleService) { 
    const cache = sessionStorage.getItem('placeSearchCache');
  if (cache) {
    try {
      const parsed = JSON.parse(cache);
      this.searchCache = new Map<string, Place[]>(
        Object.entries(parsed) as [string, Place[]][]
      );
    } catch (e) {
      console.warn('Failed to parse cache:', e);
      this.searchCache = new Map();
    }
  }
  }

 

  async ngOnInit() {
  await this.sharedDataService.googleMapsLoadedPromise; // wait for script

  this.googleMapsReady = true;

  // now safe to access google.maps
  this.autocompleteService = new google.maps.places.AutocompleteService();
  this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
}

 async ngAfterViewInit() {
  await this.sharedDataService.googleMapsLoadedPromise; // âœ… Ensure script is loaded

  if (this.map && this.map.zoomChanged) {
    this.map.zoomChanged.subscribe(() => {
      this.zoom = this.map.getZoom()!;
      this.updateMarkerLabels();
    });
  }
}

loadFilterSupportSeviceData(){
  this.sharedDataService.filterOptions$.subscribe(options => {
    this.filterOptions = options;
  });

  this.sharedDataService.organizations$.subscribe(orgs => {
    this.organizations = orgs;
  });
}

updateMarkerLabels() {
  this.supportServiceMarkers = this.supportServiceMarkers.map(marker => ({
    ...marker,
    options: {
      ...marker.options,
      label: this.zoom >= 15 ? {
        text: marker.orgName,
        fontSize: '12px',
        fontWeight: 'bold',
        className: 'marker-label'
      } : null,
      animation: null
    }
  }));
}

setupSearchDebounce() {
  this.searchSubject.pipe(
    debounceTime(600),
    distinctUntilChanged()
  ).subscribe(searchText => {
    const trimmed = searchText.trim();

    if ([3, 5, 7].includes(trimmed.length)) {
      this.updateSearchResults(trimmed);
    } else if (trimmed.length < 3) {
      this.autocompleteItems = []; 
    }
  });
}
  async initializeGoogleMapsServices() {
      await this.sharedDataService.googleMapsLoadedPromise; // âœ… Ensure script is loaded
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(
      document.createElement('div')
    );
  }

  isValidCoordinate(location: any): boolean {
    if (!location) return false;
    
    const addressParts = [
      location.OrgAddress?.trim(),
      location.OrgCity?.trim(),
      location.OrgZipCode?.trim()
    ].filter(part => part && part !== 'DNK' && part !== '');
    
    const fullAddress = addressParts.join(', ');
    return fullAddress.length > 0;
  }

  createGoogleMapsSize(width: number, height: number): google.maps.Size {
    return new google.maps.Size(width, height);
  }

 updateSearchResults(searchText: string) {
  if (searchText.length > 2) {
    // Check cache first
    if (this.searchCache.has(searchText)) {
      this.autocompleteItems = this.searchCache.get(searchText) || [];
      return;
    }

    if (!this.rateLimiter.canMakeRequest()) {
      console.warn('Rate limit exceeded. Please try again later.');
      alert('Rate limit exceeded. Please try again later.');
      return;
    }

    this.rateLimiter.recordRequest();
    this.sharedService.trackGoogleMapsApiHit('autosuggest');
    this.autocompleteService.getPlacePredictions(
      {
        input: searchText,
        componentRestrictions: { country: 'us' },
      },
      (predictions: Place[], status: string) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.autocompleteItems = predictions;
          this.searchCache.set(searchText, predictions);

        // âœ… Persist to sessionStorage
          const plainObject = Object.fromEntries(this.searchCache);
          sessionStorage.setItem('placeSearchCache', JSON.stringify(plainObject)); // Cache it
        } else {
          this.autocompleteItems = [];
        }
      }
    );
  } else {
    this.autocompleteItems = [];
  }
}

  async selectSearchResult(item: Place) {
  this.searchQuery = item.description;
  this.autocompleteItems = [];

  try {
    const result = await this.geocodePlace(item.description);
    const lat = result.lat;
    const lng = result.lng;

    if (this.getSelectedFilterCount() > 0) {
      this.filterOptions.forEach(option => option.selected = false);
      this.filterSearchTerm = '';
    }

    this.center = { lat, lng };
    this.updateSearchedLocationMarker(this.center);

    this.detectStateFromResult(result.result);

    this.filterNearbySupportCenters(lat, lng);
    this.locationcard = true;
    this.selectedLocation = null;

  } catch (error) {
    debugger;
    console.error('Search error:', error);
    const toast = await this.toastController.create({
      message: 'Could not retrieve place details. Please try again.',
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}

private detectStateFromResult(result: any) {
  let stateAbbr = '';
  let stateName = '';

  // âœ… Azure Maps: use full state name
  if (result?.address?.countrySubdivisionName) {
    stateName = result.address.countrySubdivisionName;
    stateAbbr = STATE_ABBREVIATIONS[stateName as keyof typeof STATE_ABBREVIATIONS] || result.address.countrySubdivisionCode || '';
  }

  // âœ… Google Maps fallback
  else if (result?.address_components) {
    const stateComponent = result.address_components.find((comp: any) =>
      comp.types.includes('administrative_area_level_1')
    );
    if (stateComponent) {
      stateName = stateComponent.long_name;
      stateAbbr = STATE_ABBREVIATIONS[stateName as keyof typeof STATE_ABBREVIATIONS] || stateComponent.short_name;
    }
  }

  if (stateAbbr) {
    this.currentState = stateAbbr;

    this.sharedDataService.getStateDistances().pipe(
      filter(distances => !!distances?.data),
      take(1)
    ).subscribe(distances => {
      debugger;
      const stateObj = distances?.data.find(d => d.Abbreviation === stateAbbr);
      this.searchRadius = stateObj?.Miles ? Number(stateObj.Miles) : DEFAULT_DISTANCE;
    });

  } else {
    this.currentState = '';
    this.searchRadius = DEFAULT_DISTANCE;
    console.warn('Could not detect state from result:', result);
  }
}


  async onSearch() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredLocations = [...this.organizations];
      return;
    }
    this.autocompleteItems = [];
    // Check if input is a zip code (5 digits for US)
    const isZipCode = /^\d{5}(-\d{4})?$/.test(this.searchQuery.trim());
  
    try {
      let lat: number;
      let lng: number;
      let geocodeResult: any;
  
      if (isZipCode) {
        // Handle zip code search
        const zipCodeResponse = await this.geocodeZipCode(this.searchQuery.trim());
        lat = zipCodeResponse.lat;
        lng = zipCodeResponse.lng;
        geocodeResult = zipCodeResponse.result; // Make sure your geocodeZipCode returns the full result
      } else {
        // Handle regular place search
        const placeResponse = await this.geocodePlace(this.searchQuery.trim());
        lat = placeResponse.lat;
        lng = placeResponse.lng;
        geocodeResult = placeResponse.result; // Make sure your geocodePlace returns the full result
      }
  
      if(this.getSelectedFilterCount() > 0){
        this.filterOptions.forEach(option => option.selected = false);
      this.filterSearchTerm = '';
      }
      // Update map center
      this.center = { lat, lng };
      this.updateSearchedLocationMarker(this.center);
  
      // Detect state and set search radius from the geocode result
      if (geocodeResult) {
        this.detectStateFromResult(geocodeResult);
      } else {
        this.currentState = '';
        this.searchRadius = DEFAULT_DISTANCE;
      }
  
      // Filter nearby locations with state-specific distance
      
      this.filterNearbySupportCenters(lat, lng);
      this.locationcard = true;
  
    } catch (error) {
      debugger;
      console.error('Search error:', error);
      const toast = await this.toastController.create({
        message: 'Could not find the location. Please try a different address or zip code.',
        duration: 3000,
        position: 'bottom'
      });
      await toast.present();
    }
  }
  
  // Update your geocode methods to return the full result
 private async geocodeZipCode(zipCode: string): Promise<{ lat: number; lng: number; result: any }> {
  // if (!this.rateLimiter.canMakeRequest()) {
  //   console.warn('Rate limit exceeded. Please try again later.');
  //   alert('Rate limit exceeded. Please try again later.');
  //   return;
  // }

  // this.rateLimiter.recordRequest();
  this.sharedService.trackAzureMapsApiHit('geocoding');

  try {
    const response: any = await firstValueFrom(this.azureMapsService.getGeocodeResult(zipCode));

    if (response?.results?.length > 0) {
      const result = response.results[0];
      return {
        lat: result.position.lat,
        lng: result.position.lon,
        result
      };
    } else {
      throw new Error('No results found for zip code');
    }
  } catch (error) {
    throw new Error('Geocoding failed for zip code: ' + error);
  }
}


  private async geocodePlace(query: string): Promise<{ lat: number; lng: number; result: any }> {
  // if (!this.rateLimiter.canMakeRequest()) {
  //   console.warn('Rate limit exceeded. Please try again later.');
  //   alert('Rate limit exceeded. Please try again later.');
  //   return;
  // }

  //this.rateLimiter.recordRequest();

  try {
     this.sharedService.trackAzureMapsApiHit('geocoding');
    const response: any = await firstValueFrom(this.azureMapsService.getGeocodeResult(query));

    if (response?.results?.length > 0) {
      const result = response.results[0];
      return {
        lat: result.position.lat,
        lng: result.position.lon,
        result
      };
    } else {
      throw new Error('No results found for place');
    }
  } catch (error) {
    throw new Error('Geocoding failed for place: ' + error);
  }
}

  

  updateSearchedLocationMarker(position: { lat: number; lng: number }) {
    this.center = position;
    this.zoom = 14; 
    
    // Update the marker
    this.searchedLocationMarker = {
      position: position,
      options: {
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        },
        // Optional: Add animation
        animation: google.maps.Animation.DROP
      }
    };
    
}

  filterNearbySupportCenters(lat: number, lng: number) {
    if (!lat || !lng) return;
  
    this.filteredLocations = this.organizations.filter(location => {
      const distance = this.calculateDistance(
        lat, lng, 
        location.OrgLatitude && location.OrgLongitude ? parseFloat(location.OrgLatitude) : 0, location.OrgLongitude && location.OrgLatitude ? parseFloat(location.OrgLongitude) : 0
      );
      return distance <= this.searchRadius;
    });
  
  
    this.filteredlocationwithinradius = this.filteredLocations;
    // Update map markers if using them
    if (this.updateSupportServiceMarkers) {
      this.updateSupportServiceMarkers();
    }
  
  }


  updateSupportServiceMarkers() {
    this.supportServiceMarkers = (this.filteredLocations ?? []).map((location, index) => ({
      position: { lat: location.OrgLatitude ? parseFloat(location.OrgLatitude) : 0, lng:  location.OrgLongitude ? parseFloat(location.OrgLongitude) : 0 },
      options: {
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(30, 30)
        },
        title: location.OrgName,
        label: this.zoom >= 15 ? {
          text: location.OrgName,
          fontSize: '12px',
          fontWeight: 'bold',
          className: 'marker-label'
        } : null,
        // Only apply animation on first load
        animation: this.firstLoad ? google.maps.Animation.DROP : null,
        optimized: false
      },
      click: () => this.onMarkerClick(location),
      // Only apply delay on first load
      animationDelay: this.firstLoad ? index * 100 : 0,
      orgName: location.OrgName
    }));

    // After first load, set flag to false
    if (this.firstLoad) {
      setTimeout(() => {
        this.firstLoad = false;
      }, 1000); // Slightly longer than your longest animation delay
    }
}

onSearchClear() {
  this.searchQuery = '';
  this.locationcard = false;
    this.selectedLocation = null;
    this.filterOpen = false;
  this.filteredLocations = []; // Clear the filtered locations
  this.updateSupportServiceMarkers(); // Update markers
}

  onSearchInput(event: any) {
    this.locationcard = false;
    this.selectedLocation = null;
    this.filterOpen = false;
    this.searchSubject.next(event.target.value);
  }

  center!: google.maps.LatLngLiteral;
  //center: google.maps.LatLngLiteral = { lat: 39.7783, lng: -119.4179 };  for testing purpose
  zoom = 4.2;
  filteredLocations: any[] | undefined ;
  filterSearchTerm: string = '';


  async getCurrentPosition() {
  try {
    const cachedLocation = sessionStorage.getItem('userIPLocation');
    if (cachedLocation) {
      const json = JSON.parse(cachedLocation);
      await this.processLocationData(json); 
      return;
    }

    const configMap = await firstValueFrom(this.sharedDataService.config$);
    const findLocationAPIKey = configMap['findMyIpLocationAPIKey'];
    this.sharedService.trackIPBasedLocationApi();
    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${findLocationAPIKey}`;

    this.http.get(url).subscribe(async (json: any) => {
      sessionStorage.setItem('userIPLocation', JSON.stringify(json)); 
      await this.processLocationData(json); 
    });
  } catch (error) {
    await this.showToast('Could not retrieve your location. Try again later.');
  }
}

private async processLocationData(json: any) {
  const lat = Number(json.latitude);
  const lng = Number(json.longitude);

  if (!isNaN(lat) && !isNaN(lng)) {
    this.latitude = lat;
    this.longitude = lng;
    this.center = { lat, lng };

    this.geolocationEnabled = true;
    this.locationcard = true;

    await this.reverseGeocodeForState(this.center);
    this.updateSearchedLocationMarker(this.center);
    this.filterNearbySupportCenters(lat, lng);
  } else {
    await this.showToast('Invalid location data received.');
  }
}

private async showToast(message: string) {
  const toast = await this.toastController.create({
    message,
    duration: 3000,
    position: 'bottom'
  });
  await toast.present();
}

  private async reverseGeocodeForState(location: { lat: number, lng: number }) {
    try {
      const geocoder = new google.maps.Geocoder();
      const results = await new Promise<any>((resolve, reject) => {
        geocoder.geocode({ location }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          if (status === 'OK') resolve(results);
          else reject(status);
        });
      });
  
      if (results && results.length > 0) {
        this.detectStateFromResult(results[0]); // Reuse detectStateFromResult to set currentState and searchRadius
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      this.currentState = '';
      this.searchRadius = DEFAULT_DISTANCE;
    }
  }

  handleLocationPermissionDenied() {
  this.geolocationEnabled = false;
  const userConfirmed = confirm(
    'Location access is blocked. Would you like to enable it in your browser settings?'
  );
  if (userConfirmed) {
    alert(
      'Please go to your browser settings and allow location access for this site, then refresh the page.'
    );
  }
}
 
  onInputChange(event: any) {
      if (!this.searchQuery || this.searchQuery.trim() === '') {
        this.filteredLocations = [...this.filteredlocationwithinradius];
        this.filterOptions.forEach(option => option.selected = false);
      }
    
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3963.1; // Radius of the Earth in miles
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  }

  // Convert degrees to radians
  degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  

  // getSupportServiceFilterOptions() {
  //   this.apiService.getServiceFilterOptions().subscribe(
  //     (response: any) => {
  //       if (response.data && response.data.length > 0) {        
  //         this.filterOptions = response.data; 
  //       } else {
  //         console.warn('No filter options found in the Strapi response.');
  //         this.filterOptions = []; 
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching service filter options:', error);
  //       this.filterOptions = []; 
  //     }
  //   );
  //  }
  
  //  getSupportServiceData(endpoint: string) {
  //   this.apiService.getAllSupportServices(endpoint).subscribe(
  //     (response: OrganizationResponse) => {
  //       if (response.data.length > 0) {
  //         const seenNames = new Set<string>();
  //         this.organizations = response.data.filter(org => {
  //           if (seenNames.has(org.OrgName)) {
  //             return false; 
  //           }
  //           seenNames.add(org.OrgName);
  //           return true;
  //         });
  //       } else {
  //         console.warn('No data found in the response.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching support service data:', error);
  //     }
  //   );
  // }
  
  handleSearchBarClick() {
    // Get applied filter values
    const appliedFilters = this.filterOptions
      .filter(option => option.selected)
      .map(option => option.label)
      .join(', ');
  
    // If searchQuery exactly matches applied filters, open the filter popup
    if (this.searchQuery === appliedFilters && appliedFilters.length > 0) {
      this.toggleFilter();
    }
  }
  
    // Toggle filter widget
    toggleFilter() {
      this.filterOpen = !this.filterOpen;
      this.filterSearchTerm = '';
    }
  
    // Clear filters
    clearFilters() {
      if(this.getSelectedFilterCount() > 0){
        this.filterOptions.forEach(option => option.selected = false);
      this.filterSearchTerm = '';
      }
      this.filterSearchTerm = '';
      //this.searchQuery = '';
      this.selectedLocation = null;
      //this.locationcard = false;
      //this.filteredLocations = [];
      this.filteredLocations = this.filteredlocationwithinradius;
      this.updateSupportServiceMarkers();
    }
    
    closeFilter() {
      this.filterOpen = false;
      this.filterSearchTerm = '';
    }
  
    closeLocations(){
      this.locationcard = false;
      this.searchQuery = '';
    }

      // Filtered options for search within the filter widget
  get filteredFilterOptions() {
    return this.filterOptions.filter(option =>
      option.label.toLowerCase().includes(this.filterSearchTerm.toLowerCase())
    );
  }


  applyFilters() {
    if(this.getSelectedFilterCount() == 0){
      this.filteredLocations = this.filteredlocationwithinradius;
      this.updateSupportServiceMarkers();
    }
    if (this.getSelectedFilterCount() > 0) {
      const selectedFilterKeys = this.filterOptions
        .filter(option => option.selected)
        .map(option => option.key as keyof Organization);
  
      if (selectedFilterKeys.length === 0) {
        this.filteredLocations = [...this.filteredlocationwithinradius]; // No filters selected, show all
      } else {
        const filteredOrgs = this.filteredlocationwithinradius?.filter(org => {
          return selectedFilterKeys.some(key => org[key] === true);
        });
        this.filteredLocations = filteredOrgs;
        this.updateSupportServiceMarkers();
      }

  
      this.selectedLocation = null;
      this.closeFilter();
    }
  }
  
  
  getSelectedFilterCount(): number {
    return this.filterOptions.filter(option => option.selected).length;
  }
  


  onMarkerClick(location: Organization) {
    this.selectedLocation = location; // Set the clicked location as selected
    this.segment = 'about'; // Optional: Set the default tab to 'about' when opening details
  }


  onLocationClick(location: any) {
    this.filterOpen = false;
    this.selectedLocation = location; // Set the selected location
  }

  closeDetails() {
    this.selectedLocation = null; // Hide the details card
  }

   
  resetState() {
    this.searchQuery = '';
    this.filterOpen = false;
    this.selectedLocation = null;
    this.activeTab = 'about';
    this.segment = 'about';
    this.latitude = undefined;
    this.longitude = undefined;
    this.geolocationEnabled = false;
    this.locationcard = false;
    this.userLocation = null;
    this.organizations = [];
    this.filterOptions = [];
    this.filteredLocations = undefined;
    this.filterSearchTerm = '';
  }

  
  getAboutText(location: Organization): string {
  let aboutText = '';
  let hasAddress = false;
  let skipNextParagraphJoin = false;

  // Only process AboutOrg if it's not null or empty
  if (location.AboutOrg && location.AboutOrg.length > 0) {
    location.AboutOrg.forEach((item, index) => {
      let paragraphText = '';

      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          if (child.text) {
            const cleanText = child.text.trim();

            if (child.bold) {
              paragraphText += `<strong>${cleanText}</strong>`;
              if (cleanText.toLowerCase().includes('address:')) {
                hasAddress = true;
                skipNextParagraphJoin = true;
              }
            } else {
              if (skipNextParagraphJoin) {
                paragraphText += ` ${cleanText}`;
                skipNextParagraphJoin = false;
              } else {
                paragraphText += cleanText;
              }
            }
          }
        });

        if (!skipNextParagraphJoin && paragraphText.trim() !== '') {
          aboutText += paragraphText + '\n';
        } else if (skipNextParagraphJoin) {
          aboutText += paragraphText;
        }
      }
    });
  }

  // Always try to append address from fallback values if no address was found in AboutOrg
  if (!hasAddress) {
    const addressParts = [
      location.OrgAddress?.trim(),
      location.OrgCity?.trim(),
      location.OrgZipCode?.trim()
    ].filter(part => part && part !== 'DNK');

    const address = addressParts.join(', ');
    if (address) {
      aboutText += `${aboutText ? '\n' : ''}<strong>Address:</strong> ${address}`;
    }
  }

  return aboutText.trim().replace(/\n\s*\n/g, '\n');
}

  //Get the sevices from the constants
  getServices(location: Organization): { name: string, value: string | boolean | null, isHotline?: boolean }[] {
    if (!location) return [];
  
    let services: { name: string, value: string | boolean | null, isHotline?: boolean }[] = [];
  
    // Combine hotline numbers into one entry
    if (location.OrgHotline && typeof location.OrgHotline === 'string' && location.OrgHotline.trim().length > 0) {
      const hotlineNumbers = location.OrgHotline
        .split(';')
        .map(number => number.trim())
        .filter(number => number.length > 0);
  
      const hotlineLinks = hotlineNumbers
        .map(number => `<a href="tel:${number}">${number}</a>`)
        .join(', '); // Or use " | " if you prefer
  
      services.push({
        name: 'Hotline',
        value: hotlineLinks,
        isHotline: true
      });
    }
  
    // Add other services
    services = services.concat(
      this.filterOptions
        .filter(option => option.key !== 'IsHotline')
        .filter(option => {
          const value = location[option.key as keyof Organization];
          return (typeof value === 'boolean' && value === true) ||
                 (typeof value === 'string' && value.trim().length > 0);
        })
        .map(option => ({
          name: option.label,
          value: location[option.key as keyof Organization] as string | boolean | null,
          isHotline: false
        }))
    );
  
    return services;
  }

  changeSegment(segmentValue: string) {
    this.segment = segmentValue;
  }

  async openGoogleMapsByAddress(location: Organization) {
    // Construct address string, ignore 'DNK' or empty parts
    const addressParts = [
      location.OrgAddress?.trim(),
      location.OrgCity?.trim(),
      location.OrgZipCode?.trim()
    ].filter(part => part && part !== 'DNK');
  
    const fullAddress = encodeURIComponent(addressParts.join(', '));
  
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${fullAddress}`;
  
    // Platform-specific logic
    if (this.platform.is('android') || this.platform.is('ios')) {
      try {
        const result: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'com.google.android.apps.maps' });
        if (result.value) {
          await AppLauncher.openUrl({ url: `geo:0,0?q=${fullAddress}` });
        } else {
          window.open(googleMapsUrl, '_blank');
        }
      } catch (err) {
        console.error('Map app check failed:', err);
        window.open(googleMapsUrl, '_blank');
      }
    } else {
      // Web fallback
      window.open(googleMapsUrl, '_blank');
    }
  }
  
  async openGoogleMaps(latitude: string, longitude: string, location: Organization) {
    const lat = Number(latitude);
    const lng = Number(longitude);
  
    // Combine address for label (excluding "DNK" and trimming spaces)
    const addressParts = [
      location.OrgAddress?.trim(),
      location.OrgCity?.trim(),
      location.OrgZipCode?.trim()
    ].filter(part => part && part !== 'DNK');
  
    const placeLabel = encodeURIComponent(addressParts.join(', ') || 'Location');
  
    if (this.platform.is('android')) {
      const googleMapsUrl = `geo:${lat},${lng}?q=${lat},${lng}(${placeLabel})`;
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${placeLabel})`;
  
      try {
        const result: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'com.google.android.apps.maps' });
        if (result.value) {
          await AppLauncher.openUrl({ url: googleMapsUrl });
        } else {
          window.open(webUrl, '_blank');
        }
      } catch (error) {
        console.error('Android map open failed, fallback to browser:', error);
        window.open(webUrl, '_blank');
      }
  
    } else if (this.platform.is('ios')) {
      const appleMapsUrl = `maps://?q=${placeLabel}&ll=${lat},${lng}`;
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${placeLabel})`;
  
      try {
        const result: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'maps://' });
        if (result.value) {
          await AppLauncher.openUrl({ url: appleMapsUrl });
        } else {
          window.open(webUrl, '_blank');
        }
      } catch (error) {
        console.error('iOS map open failed, fallback to browser:', error);
        window.open(webUrl, '_blank');
      }
  
    } else {
      // Web fallback
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${placeLabel})`;
      window.open(webUrl, '_blank');
    }
  }

  openServices(location: any) {
    this.selectedLocation = location;
    this.segment = 'services';
  }

openSupport(supportUrl: string): void {
  // Ensure the URL has a protocol
  let url = supportUrl.trim();
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }
  // Opens support website in a new tab
  window.open(url, '_blank');
}

  async openPhone(phoneNumber: string) {
    // Ensure phoneNumber is a string and clean it (remove spaces, dashes, etc.)
    const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const telUrl = `tel:${cleanedNumber}`;

    if (this.platform.is('android') || this.platform.is('ios')) {
      // For native platforms (Android/iOS), use the tel: URI directly
      try {
        // Attempt to open the native dialer
        window.location.href = telUrl;
      } catch (error) {
        console.error('Error opening phone dialer:', error);
        alert('Unable to open the phone dialer. Please dial the number manually: ' + cleanedNumber);
      }
    } else {
      // Web platform (browser)
      try {
        // Open the tel: URI, which will trigger the default telephony app if configured
        window.open(telUrl, '_blank');
      } catch (error) {
        console.error('Error opening phone in browser:', error);
        alert('No telephony app available. Please dial the number manually: ' + cleanedNumber);
      }
    }
  }

}
