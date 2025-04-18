import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { HeaderComponent } from "./controls/header/header.component";
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ApiService } from './services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { Capacitor } from '@capacitor/core';


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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, MenuComponent, HeaderComponent, CommonModule]
})
export class AppComponent implements OnInit,OnDestroy,AfterViewInit  {
  isMobile!: boolean;
  organizations: Organization[] = [];
  filterOptions: FilterOption[] = [];
  @ViewChild('mobileToggle', { static: false }) mobileToggle!: ElementRef<HTMLInputElement>;
  isMenuOpen = false;
  public readonly endPoint : string = APIEndpoints.supportService;

  constructor(private platform: Platform, private router:Router, private apiService: ApiService, private sharedDataService:MenuService) {
    this.isMobile = this.platform.is('android') || this.platform.is('ios');

  }

  ngOnInit() {
    this.loadInitialData();
    if (Capacitor.isNativePlatform()) {
      this.platform.ready().then(() => {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setStyle({ style: Style.Dark }); // or Style.Light
      });
    }

    const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
      this.router.navigate(['/home']); // Redirect to home if page is refreshed
    }
  }

  ngAfterViewInit() {
    debugger;
    if (this.mobileToggle) {
      this.isMenuOpen = this.mobileToggle.nativeElement.checked;

      this.mobileToggle.nativeElement.addEventListener('change', () => {
        this.isMenuOpen = this.mobileToggle.nativeElement.checked;
      });
    }
  }

  loadInitialData() {
    this.apiService.getServiceFilterOptions().subscribe(response => {
      this.filterOptions = response.data || [];
      this.sharedDataService.setFilterOptions(this.filterOptions);
    });

    this.apiService.getAllSupportServices(this.endPoint).subscribe((response: OrganizationResponse) => {
      const seenNames = new Set<string>();
      this.organizations = response.data.filter(org => {
        if (seenNames.has(org.OrgName)) return false;
        seenNames.add(org.OrgName);
        return true;
      });
      this.sharedDataService.setOrganizations(this.organizations);
    });
   
  }

  closeMobileMenu() {
    if (this.isMobile && this.mobileToggle?.nativeElement.checked) {
      this.mobileToggle.nativeElement.checked = false;
      this.isMenuOpen = false;
    }
  }

  ngOnDestroy() {
  }
}
