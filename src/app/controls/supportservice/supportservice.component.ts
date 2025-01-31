import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }


  ngOnInit() {
    
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
  filteredLocations = [...this.locations];

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

  getDirectionsAndDistance(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) {
    const directionsApiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=AIzaSyAJ_ySiFipBP82xYIin5o0_rpfPYPNKaa0`;
    const distanceMatrixApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=AIzaSyAJ_ySiFipBP82xYIin5o0_rpfPYPNKaa0`;

    // Get directions
    this.http.get(directionsApiUrl).subscribe((directionsResponse: any) => {
      if (directionsResponse.routes && directionsResponse.routes.length > 0) {
        const route = directionsResponse.routes[0];
        console.log('Directions:', route);
      }
    });

    // Get distance
    this.http.get(distanceMatrixApiUrl).subscribe((distanceResponse: any) => {
      if (distanceResponse.rows && distanceResponse.rows.length > 0) {
        const distance = distanceResponse.rows[0].elements[0].distance.text;
        console.log('Distance:', distance);
      }
    });
  }

  // Handle direction button click
  onDirectionsClick(location: any) {
    const origin = this.center; // Use the current map center as the origin
    const destination = { lat: location.lat, lng: location.lng };
    this.getDirectionsAndDistance(origin, destination);
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

}
