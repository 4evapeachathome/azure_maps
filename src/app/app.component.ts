import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { HeaderComponent } from "./controls/header/header.component";
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ApiService } from './services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';


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
  imports: [IonicModule, MenuComponent, HeaderComponent,FormsModule, CommonModule,RouterModule]
})
export class AppComponent implements OnInit,OnDestroy,AfterViewInit  {
  isMobile!: boolean;
  organizations: Organization[] = [];
  filterOptions: FilterOption[] = [];
  @ViewChild('mobileToggle', { static: false }) mobileToggle!: ElementRef<HTMLInputElement>;
  @ViewChild('desktopToggle', { static: false }) desktopToggle!: ElementRef<HTMLInputElement>;
  isRiskAssessment = false;
isRouteCheckComplete = false;

isMenuOpen = true;
  public readonly endPoint : string = APIEndpoints.supportService;

  private riskRoutes = ['riskassessment', 'riskassessmentresult', 'riskassessmentsummary','loginPage'];

  constructor(private platform: Platform, private router:Router, private apiService: ApiService, private sharedDataService:MenuService) {
    this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: NavigationEnd) => {
    const url = event.urlAfterRedirects;
    const currentPath = url.split('/')[1];

    this.isRiskAssessment = this.riskRoutes.includes(currentPath);
    this.isRouteCheckComplete = true;

    if (this.isRiskAssessment) {
      localStorage.setItem('lastRiskAssessmentUrl', url);
    }
  });

  }

  ngOnInit() {
      this.loadInitialData();
      if (Capacitor.isNativePlatform()) {
        this.platform.ready().then(() => {
          StatusBar.setOverlaysWebView({ overlay: false });
          StatusBar.setStyle({ style: Style.Dark }); // or Style.Light
        });
      }  
      this.isMobile = this.platform.is('mobile') || this.platform.is('mobileweb');
      const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];

      if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
        const lastRiskUrl = localStorage.getItem('lastRiskAssessmentUrl');
    
        if (lastRiskUrl && this.riskRoutes.includes(lastRiskUrl.split('/')[1])) {
          this.router.navigateByUrl(lastRiskUrl); // Go back to the same page
        } else {
          this.router.navigate(['/home']);
        }
      }
    
  }


  ngAfterViewInit() {
    const toggleRef = this.isMobile ? this.mobileToggle : this.desktopToggle;
  
    if (toggleRef) {
      // Set initial value
      this.isMenuOpen = toggleRef.nativeElement.checked;
  
      // Listen to changes
      toggleRef.nativeElement.addEventListener('change', () => {
        this.isMenuOpen = toggleRef.nativeElement.checked;
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
