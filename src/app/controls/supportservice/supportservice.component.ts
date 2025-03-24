import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, Platform, ToastController } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppLauncher, CanOpenURLResult } from '@capacitor/app-launcher';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { APIEndpoints } from 'src/shared/endpoints';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

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
  OrgLatitude: number;
  OrgLongitude: number;
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
  public readonly endPoint : string = APIEndpoints.supportService;

  autocompleteService: any;
  placesService: any;
  autocompleteItems: Place[] = [];
  searchSubject = new BehaviorSubject<string>('');

  searchedLocationMarker: any = null;
  supportServiceMarkers: any[] = [];


  constructor(private http: HttpClient,private platform: Platform,private apiService:ApiService, private toastController: ToastController) { 
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(
      document.createElement('div')
    );
  }

 

  ngOnInit() {
    this.initializeGoogleMapsServices();
    this.getSupportServiceFilterOptions();
    this.getSupportServiceData(this.endPoint);

    this.setupSearchDebounce();
  }

  setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => {
      if (searchText) {
        this.updateSearchResults(searchText);
      } else {
        this.autocompleteItems = [];
      }
    });
  }

  initializeGoogleMapsServices() {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(
      document.createElement('div')
    );
  }
  

  createGoogleMapsSize(width: number, height: number): google.maps.Size {
    return new google.maps.Size(width, height);
  }

  updateSearchResults(searchText: string) {
    if (searchText.length > 2) {
      this.autocompleteService.getPlacePredictions(
        {
          input: searchText,
          componentRestrictions: { country: 'us' },
        },
        (predictions: Place[], status: string) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.autocompleteItems = predictions;
          } else {
            this.autocompleteItems = [];
          }
        }
      );
    } else {
      this.autocompleteItems = [];
    }
  }

  selectSearchResult(item: Place) {
    this.searchQuery = item.description;
    this.autocompleteItems = [];
    
    this.placesService.getDetails(
      { placeId: item.place_id },
      (placeDetails: any, status: string) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const lat = placeDetails.geometry.location.lat();
          const lng = placeDetails.geometry.location.lng();
          
          // Update map center
          this.center = { lat, lng };
          this.updateSearchedLocationMarker(this.center);
          
          // Filter and update both map markers and list
          this.filterNearbySupportCenters(lat, lng);
          
          // Reset selected location
          this.selectedLocation = null;
        }
      }
    );
  }

  async onSearch() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      // If search is empty, show all locations or default view
      this.filteredLocations = [...this.filteredlocationwithinradius];
      return;
    }
  
    try {
      // Use Google Places API to geocode the search query
      const geocoder = new google.maps.Geocoder();
      const response = await new Promise<any>((resolve, reject) => {
        geocoder.geocode({ address: this.searchQuery }, (results: any, status: any) => {
          if (status === 'OK') {
            resolve(results[0]); // Take the first result
          } else {
            reject(status);
          }
        });
      });
  
      // Extract coordinates from the geocoding result
      const lat = response.geometry.location.lat();
      const lng = response.geometry.location.lng();
  
      // Update map center
      this.center = { lat, lng };
      this.zoom = 12;
  
      // Update searched location marker
      this.updateSearchedLocationMarker(this.center);
  
      // Filter nearby locations
      this.filterNearbySupportCenters(lat, lng);
  
    } catch (error) {
      console.error('Geocoding error:', error);
      // Show error to user
      const toast = await this.toastController.create({
        message: 'Could not find the location. Please try a different address.',
        duration: 3000,
        position: 'top'
      });
      await toast.present();
    }
  }
  
  

  updateSearchedLocationMarker(position: { lat: number; lng: number }) {
    this.searchedLocationMarker = {
      position: position,
      options: {
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      }
    };
  }

  filterNearbySupportCenters(lat: number, lng: number) {
    if (!lat || !lng) {
      console.error('Coordinates are not available');
      return;
    }
  
    this.filteredLocations = this.organizations.filter(location => {
      const distance = this.calculateDistance(
        lat,
        lng,
        location.OrgLatitude,
        location.OrgLongitude
      );
      return distance <= 100; // Within 100km
    });
  
    this.filteredlocationwithinradius = this.filteredLocations;
    // Update map markers if using them
    if (this.updateSupportServiceMarkers) {
      this.updateSupportServiceMarkers();
    }
  }

  updateSupportServiceMarkers() {
    this.supportServiceMarkers = (this.filteredLocations ?? []).map(location => ({
      position: { lat: location.OrgLatitude, lng: location.OrgLongitude },
      options: {
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(30, 30)
        },
        label: location.OrgName
      },
      click: () => this.onMarkerClick(location)
    }));
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }


  center: google.maps.LatLngLiteral = { lat: 36.7783, lng: -119.4179 };
  zoom = 12;
  filteredLocations: any[] | undefined ;
  filterSearchTerm: string = '';





  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      this.geolocationEnabled = true;
      this.locationcard = true;
      // this.center = { lat: this.latitude, lng: this.longitude };
  
      console.log('Current position:', this.center);
      console.log('Latitude:', this.latitude, 'Longitude:', this.longitude);
  
      this.filterNearbySupportCenters(36.7783,-119.4179);
      this.updateSearchedLocationMarker({ lat: 36.7783, lng: -119.4179 });
    } catch (error: any) { // Explicitly type the error
      if (error.code === error.PERMISSION_DENIED) {
        console.log('Location access denied by user.');
        this.handleLocationPermissionDenied();
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        console.log('Location information is unavailable.');
      } else if (error.code === error.TIMEOUT) {
        console.log('The request to get user location timed out.');
      } else {
        console.log('An unknown error occurred:', error.message);
      }
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
    const R = 6371; // Radius of the Earth in km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  // Convert degrees to radians
  degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  

  getSupportServiceFilterOptions() {
    this.apiService.getServiceFilterOptions().subscribe(
      (response: any) => {
      //  debugger;
        if (response.data && response.data.length > 0) {        
          this.filterOptions = response.data; 
          console.log('Fetched filter options:', this.filterOptions);
        } else {
          console.warn('No filter options found in the Strapi response.');
          this.filterOptions = []; 
        }
      },
      (error) => {
        console.error('Error fetching service filter options:', error);
        this.filterOptions = []; 
      }
    );
   }
  
  getSupportServiceData(endpoint:string) {
    this.apiService.getAllSupportServices(endpoint).subscribe(
       (response : OrganizationResponse) => {
         if (response.data.length>0) {
          this.organizations = response.data;
           
        
         } else {
           console.warn('No data found in the response.');
          
         }
       },
       (error) => {
         console.error('Error fetching support service data:', error);
       }
     );
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
      
      if(this.searchQuery?.trim() === ''){
       this.filteredLocations = [...this.filteredlocationwithinradius];
      }
      }
      this.filterSearchTerm = '';
      this.selectedLocation = null;
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

  // Apply filters
 applyFilters() {
  debugger;
  if(this.getSelectedFilterCount() > 0){
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
  }
  this.selectedLocation = null;
  this.searchQuery = '';
  this.closeFilter();
  }
  
  
}
  getSelectedFilterCount(): number {
    return this.filterOptions.filter(option => option.selected).length;
  }

  onIconClick() {
    console.log('Icon clicked!');
    if(!this.geolocationEnabled){
      alert(
        'Please turn on the location.'
      );
    }
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
    this.userLocation = null;
    this.organizations = [];
    this.filterOptions = [];
    this.filteredLocations = undefined;
    this.filterSearchTerm = '';
  }

  
  getAboutText(location: Organization): string {
    if (!location.AboutOrg || location.AboutOrg.length === 0) return '';

    let aboutText = '';
    let hasAddress = false;

    // Process AboutOrg to build the text, checking for an address
    location.AboutOrg.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          if (child.text) {
            if (child.bold) {
              aboutText += `<strong>${child.text.trim()}</strong>`;
            } else {
              aboutText += child.text.trim();
            }
            // Check if this text contains an address (e.g., "Address:" followed by text)
            if (child.text.toLowerCase().includes('address:')) {
              hasAddress = true;
            }
            aboutText += '\n'; // Add a newline for paragraph breaks
          }
        });
      }
    });

    if (!hasAddress) {
      const addressParts = [
        location.OrgAddress.trim(),
        location.OrgCity.trim(),
        `${location.OrgZipCode.trim()}}`
      ].filter(part => part && part !== 'DNK'); // Exclude "DNK" placeholders
      const address = addressParts.join(', ');
      if (address) {
        aboutText += `\n\n<strong>Address:</strong>\n${address}`;
      }
    } else {
      aboutText = aboutText.replace(/\n\n/g, '\n').trim(); // Ensure proper spacing
    }

    return aboutText.trim().replace(/\n\s*\n/g, '\n'); // Clean up extra newlines
  }

  //Get the sevices from the constants
  getServices(location: Organization): { name: string, value: string | boolean | null, isHotline?: boolean }[] {
    if (!location) return [];

    let services: { name: string, value: string | boolean | null, isHotline?: boolean }[] = [];

    // Add OrgHotline as the first service if it exists, marked as a hotline
    if (location.OrgHotline && typeof location.OrgHotline === 'string' && location.OrgHotline.trim().length > 0) {
      services.push({
        name: 'Hotline',
        value: location.OrgHotline,
        isHotline: true // Flag to indicate this is the hotline for styling
      });
    }

    // Add other services from dynamically fetched filterOptions, excluding IsHotline to avoid duplication
    services = services.concat(
      this.filterOptions
        .filter(option => option.key !== 'IsHotline') // Exclude IsHotline to avoid duplication with OrgHotline
        .filter(option => {
          const value = location[option.key as keyof Organization];
          return (typeof value === 'boolean' && value === true) || 
                 (typeof value === 'string' && value.trim().length > 0);
        })
        .map(option => ({
          name: option.label,
          value: location[option.key as keyof Organization] as string | boolean | null,
          isHotline: false // Not a hotline
        }))
    );

    return services;
  }

  changeSegment(segmentValue: string) {
    this.segment = segmentValue;
  }

  
  async openGoogleMaps(latitude: number, longitude: number) {
    // Ensure latitude and longitude are numbers
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (this.platform.is('android')) {
      // Android: Try to open Google Maps app
      const googleMapsUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      try {
        const result: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'com.google.android.apps.maps' });
        if (result.value) {
          // Google Maps app is available, launch it
          await AppLauncher.openUrl({ url: googleMapsUrl });
        } else {
          // Fallback to browser if Google Maps app is not installed
          window.open(webUrl, '_blank');
        }
      } catch (error) {
        console.error('Error checking Google Maps app availability:', error);
        window.open(webUrl, '_blank'); // Fallback to browser on error
      }
    } else if (this.platform.is('ios')) {
      // iOS: Try to open Apple Maps app
      const appleMapsUrl = `maps://?q=${lat},${lng}&ll=${lat},${lng}`;
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      try {
        const result: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'maps://' });
        if (result.value) {
          // Apple Maps is available, launch it
          await AppLauncher.openUrl({ url: appleMapsUrl });
        } else {
          // Fallback to browser if Apple Maps is not available
          window.open(webUrl, '_blank');
        }
      } catch (error) {
        console.error('Error checking Apple Maps availability:', error);
        window.open(webUrl, '_blank'); // Fallback to browser on error
      }
    } else {
      // Web or other platforms: Open in browser
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(webUrl, '_blank');
    }
  }

  openServices(location: any) {
    this.selectedLocation = location;
    this.segment = 'services';
  }

  openSupport(supportUrl:string) {
    // Opens support website in a new tab
    window.open(supportUrl, '_blank');
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
