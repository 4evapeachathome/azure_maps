import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, AfterViewChecked, HostListener, ChangeDetectorRef } from '@angular/core';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { Location } from '@angular/common';
import { HeaderComponent } from "./controls/header/header.component";
import { BehaviorSubject, filter, forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ApiService } from './services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { SessionActivityService } from './guards/session-activity.service';
import { CookieService } from 'ngx-cookie-service';
import { PageTitleService } from './services/page-title.service';
import { LoggingService } from './services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';


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
  sidebarHeight = 'auto';
  private sessionAlert: HTMLIonAlertElement | null = null;
  organizations: Organization[] = [];
  filterOptions: FilterOption[] = [];
  @ViewChild('mobileToggle', { static: false }) mobileToggle!: ElementRef<HTMLInputElement>;
  @ViewChild('desktopToggle', { static: false }) desktopToggle!: ElementRef<HTMLInputElement>;
  isRiskAssessment = false;
  isRouteCheckComplete = false;
  routeReady$ = new BehaviorSubject<boolean>(false);
  showSessionWarning = false;
  isMenuOpen = true;
  public readonly endPoint : string = APIEndpoints.supportService;
  private initializedToggle: boolean = false;
  private readonly riskRoutes = [
    'riskassessment', 'setpassword', 'riskassessmentsummary', 'login',
    'hitsassessment', 'dangerassessment',
    'ssripariskassessment', 'webassessment', 'viewresult'
  ];
  device:any;
  
  /** These routes should keep session alert active (subset of risk routes) */
  private readonly sessionAlertRoutes = [
    'riskassessment', 'hitsassessment', 'ssripariskassessment',
    'riskassessmentsummary', 'webassessment',
    'dangerassessment', 'viewresult'
  ];
  constructor(
    private sessionActivityService: SessionActivityService,
    private alertController: AlertController,
    private cookieService: CookieService,
    private platform: Platform,
    private location:Location,
    private router: Router,
    private deviceService: DeviceDetectorService,
    private cdr: ChangeDetectorRef,
    private loggingService: LoggingService,
    private apiService: ApiService,
    private sharedDataService: MenuService,
    private pageService: PageTitleService,
  ) {
    this.device = this.deviceService.getDeviceInfo();
  }

  stayLoggedIn() {
    this.showSessionWarning = false;
    const now = Date.now().toString();
    this.cookieService.set('loginTime', now, {
      path: '/',
      sameSite: 'Strict',
      secure: true,
    });
  }

  expandMenu(sectionTitle: string) {
    this.sharedDataService.toggleAdditionalMenus(true, sectionTitle);
  }

  async logout() {
    if (this.sessionAlert) {
      await this.sessionAlert.dismiss();
      this.sessionAlert = null;
    }
    this.pageService.trackLogout();
  
    this.cookieService.delete('username');
    this.cookieService.delete('loginTime');
    this.cookieService.delete('userdetails');
  
    this.router.navigate(['/login']);
  }
  
  
  ngOnInit() {
    this.loadInitialData();

     this.sharedDataService.contentHeight$.subscribe((height) => {
      this.sidebarHeight = height > 0 ? `${height}px` : 'auto';
    });
  
    // Set up native platform status bar if needed
    if (Capacitor.isNativePlatform()) {
      this.platform.ready().then(() => {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setStyle({ style: Style.Dark });
      });
    }
  
    // Listen to router navigation changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const currentPath = url.split('/')[1]?.split('?')[0]; // Without leading slash
        
      
        // Check if current route is a risk assessment route
        this.isRiskAssessment = this.riskRoutes.includes(currentPath);

          //tracking page view with Google Analytics
        const pageTitle = this.pageService.getPageTitle(url);

      const deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';

      this.pageService.trackPageView(url, pageTitle, this.isRiskAssessment ? 'Risk Assessment' : 'Education', deviceType);
  
  
        // Signal that route check is complete
        this.routeReady$.next(true);
  
        // Expand/collapse menu logic based on current path
        this.expandMenu(currentPath);
  
        // Check whether session alert should stay active
        const stillValid = this.sessionAlertRoutes.includes(currentPath);
        if (!stillValid && this.sessionAlert) {
          this.sessionAlert.dismiss();
          this.sessionAlert = null;
        }
      });
  
    // Session warning alert logic
    this.sessionActivityService.sessionWarning$.subscribe(() => {
      if (this.shouldShowSessionAlert()) {
        this.presentSessionAlert();
      }
    });
  
    // Session expiration logic
    this.sessionActivityService.sessionExpired$.subscribe(() => {
      if (this.isUserLoggedIn()) {
        this.logout();
      }
  
      if (this.sessionAlert) {
        this.sessionAlert.dismiss();
        this.sessionAlert = null;
      }
    });
  }


private isUserLoggedIn(): boolean {
  return this.cookieService.check('username') &&
         this.cookieService.check('userdetails') &&
         this.cookieService.check('loginTime');
}

private shouldShowSessionAlert(): boolean {
  const currentPath = this.location.path();

  const validRoutes = [
    '/riskassessment',
    '/hitsassessment',
    '/riskassessmentsummary',
    '/webassessment',
    '/ssripariskassessment',
    '/dangerassessment'
  ];

  return this.isUserLoggedIn() && validRoutes.some(route => currentPath.startsWith(route));
}

async presentSessionAlert() {
  if (this.sessionAlert) return; // prevent duplicate popups

  this.sessionAlert = await this.alertController.create({
    header: 'Session Expiring',
    message: 'You will be logged out in 5 minutes due to inactivity.',
    buttons: [
      {
        text: 'Stay Logged In',
        handler: () => {
          this.sessionActivityService.resetSessionTimers(); // Optionally restart timer
          this.sessionAlert = null;
        }
      }
    ],
    backdropDismiss: false
  });

  await this.sessionAlert.present();
}


ngAfterViewInit() {

  this.platform.ready().then(() => {

    this.isMobile = window.innerWidth <= 768;

    this.isMenuOpen = !this.isMobile;

    this.cdr.detectChanges();

    if (this.isRouteCheckComplete && !this.initializedToggle) {
      this.initializedToggle = true;

      setTimeout(() => this.initializeToggleRef(), 0);
    }
  });
}

initializeToggleRef() {
  const toggleRef = this.isMobile ? this.mobileToggle : this.desktopToggle;

  if (toggleRef) {

    toggleRef.nativeElement.addEventListener('change', () => {
      this.isMenuOpen = toggleRef.nativeElement.checked;
    });
  } else {
  }
}
  

  loadInitialData() {
  forkJoin([
    this.apiService.getServiceFilterOptions(),
    this.apiService.getAllSupportServices(this.endPoint),
    this.apiService.getSupportServiceDistances()
  ]).subscribe({
    next: ([filtersResponse, orgsResponse, distances]: [any, OrganizationResponse, any]) => {
      this.sharedDataService.setFilterOptions(filtersResponse.data || []);

      const seenNames = new Set<string>();
      const uniqueOrgs = orgsResponse.data.filter(org => {
        if (seenNames.has(org.OrgName)) return false;
        seenNames.add(org.OrgName);
        return true;
      });
      this.sharedDataService.setOrganizations(uniqueOrgs);

      this.sharedDataService.setStateDistances(distances);

      this.sharedDataService.setDataLoaded(true);
    },
    error: (err: any) => {
      console.error("Error loading initial data", err);

      const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';

      this.loggingService.handleApiErrorEducationModule(
        'Failed to load support service initial data', // Activity Type
        'loadInitialData',                             // Function name
        'forkJoin: getServiceFilterOptions + getAllSupportServices + getSupportServiceDistances', // API(s)
        '',           
        errorMessage,                                  // Error message
        err?.status,                                   // HTTP status code
        this.device                                     // Device info
      );

      this.sharedDataService.setDataLoaded(true); // Unblock UI
    }
  });
}

  closeMobileMenu() {
    if (this.isMobile && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  ngOnDestroy() {
  }
}
