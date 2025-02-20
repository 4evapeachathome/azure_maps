import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgModule, OnInit, ViewChild } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';

declare var google: any;

@Component({
  selector: 'pathome-supportservice',
  templateUrl: './supportservice.component.html',
  styleUrls: ['./supportservice.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, GoogleMapsModule, FormsModule ],
})
export class SupportserviceComponent  implements OnInit {
  searchQuery: string = '';
  filterOpen: boolean = false;
  selectedLocation: any = null;
  activeTab: string = 'about';
  segment: string = 'about';
  latitude: number | undefined;
  longitude: number | undefined;
  geolocationEnabled: boolean = false;
  userLocation: any = null;
  private readonly phoneNumber = '+1234567890';
  private readonly websiteUrl = 'https://your-services-website.com';
  private readonly supportUrl = 'https://your-support-website.com';

  constructor(private http: HttpClient,private platform: Platform) { }


  ngOnInit() {
    //this.getCurrentPosition();
  }
  center: google.maps.LatLngLiteral = { lat: 47.6062, lng: -122.3321 };
  zoom = 12;

  // Locations and filters
  locations = [
    {
      lat: 47.608,
      lng: -122.335,
      name: 'Thrive Together',
      tags: ['Child support', 'Medical'],
    },
    {
      lat: 47.603,
      lng: -122.330,
      name: 'Los Angeles Center',
      tags: ['Community outreach'],
    },
    {
      lat: 27.609,
      lng: -152.340,
      name: 'Thrive Together',
      tags: ['Counseling', 'Hotline'],
    },
    {
      lat: 50.609,
      lng: -142.340,
      name: 'Health and Justice',
      tags: ['Counseling', 'Hotline'],
    },
    {
      lat: 23.609,
      lng: -12.340,
      name: 'Thrive Together',
      tags: ['Counseling', 'Hotline'],
    },
    {
      lat: 49.609,
      lng: -162.340,
      name: 'Wellness Center',
      tags: ['Counseling', 'Hotline'],
    },
  ];
  filteredLocations: any[] | undefined ;

  filteredLocationss = [
    { 
      name: "Thrive Together",
      hours: "24/7",
      description: "Thrive Together was originally established in 1999 as Iowa Deaf Women’s Advocacy Services...",
      address: "4225 Glass Rd NE, Cedar Rapids, IA 52402",
      about: "Thrive Together was originally established in 1999 as Iowa Deaf Women’s Advocacy Services (IDWAS) by four local Deaf women, primarily to provide support, information, and peer counseling services to Deaf, Hard of Hearing, and Deaf-Blind women throughout Iowa.",
      services: "Providing legal aid, counseling, shelter services, and support for domestic abuse survivors."
    }
  ];
  // Filter functionality

  filterSearchTerm: string = '';
  filterOptions = [
    { label: 'Basic needs assistance', selected: false },
    { label: 'Child support', selected: false },
    { label: 'Community outreach', selected: false },
    { label: 'Counseling', selected: false },
    { label: 'Court-based', selected: false },
    { label: 'Hotline', selected: false },
    { label: 'Medical', selected: false },
  ];

  // Filtered options for search within the filter widget
  get filteredFilterOptions() {
    return this.filterOptions.filter(option =>
      option.label.toLowerCase().includes(this.filterSearchTerm.toLowerCase())
    );
  }

  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      this.geolocationEnabled = true;
      // this.center = { lat: this.latitude, lng: this.longitude };
  
      console.log('Current position:', this.center);
      console.log('Latitude:', this.latitude, 'Longitude:', this.longitude);
  
      this.filterNearbySupportCenters();
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

  // Toggle filter widget
  toggleFilter() {
    this.filterOpen = !this.filterOpen;
  }

  // Clear filters
  clearFilters() {
    this.filterOptions.forEach(option => (option.selected = false));
  }

  // Apply filters
  applyFilters() {
    const selectedFilters = this.filterOptions
      .filter(option => option.selected)
      .map(option => option.label);

    if (selectedFilters.length === 0) {
      this.filteredLocations = [...this.locations];
    } else {
      this.filteredLocations = this.locations.filter(location =>
        location.tags.some(tag => selectedFilters.includes(tag))
      );
    }

    this.filterOpen = false;
  }

  // Search functionality
  onSearch() {
    this.filteredLocations = this.locations.filter(location =>
      location.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onIconClick() {
    console.log('Icon clicked!');
    if (!this.userLocation) { // Only request location if we don’t already have it
      this.getCurrentPosition();
    }
  }

  onLocationClick(location: any) {
    this.selectedLocation = location; // Set the selected location
  }

  closeDetails() {
    this.selectedLocation = null; // Hide the details card
  }
  
  closeFilter(){
    this.filterOpen = false;
  }

  changeSegment(segmentValue: string) {
    this.segment = segmentValue;
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

  // Filter support centers within 10km
  filterNearbySupportCenters() {
    if (!this.geolocationEnabled || !this.center.lat || !this.center.lng) {
      console.error('Geolocation is not available or not set');
      return;
    }
  
    this.filteredLocations = this.locations.filter(location => {
      const distance = this.calculateDistance(this.center.lat, this.center.lng, location.lat, location.lng);
      console.log(`Distance to ${location.name}: ${distance.toFixed(2)} km`);
      return distance <= 100; // Keep locations within 100km
    });
  
    console.log('Filtered support centers:', this.filteredLocations);
  }
  
  openGoogleMaps() {
    // Opens Google Maps in a new tab with specified coordinates
    const mapsUrl = `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
    window.open(mapsUrl, '_blank');
  }

  openServices() {
    // Opens services website in a new tab
    window.open(this.websiteUrl, '_blank');
  }

  openSupport() {
    // Opens support website in a new tab
    window.open(this.supportUrl, '_blank');
  }

  openPhone() {
    // Opens phone app with specified number
    window.location.href = `tel:${this.phoneNumber}`;
  }


}
