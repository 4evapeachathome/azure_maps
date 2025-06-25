import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, AfterViewChecked, HostListener, ChangeDetectorRef } from '@angular/core';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { Location } from '@angular/common';
import { HeaderComponent } from "./controls/header/header.component";
import { BehaviorSubject, filter, Subscription } from 'rxjs';
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
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    private sharedDataService: MenuService
  ) {
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
  
    this.cookieService.delete('username');
    this.cookieService.delete('loginTime');
    this.cookieService.delete('userdetails');
  
    this.router.navigate(['/login']);
  }
  
  
  ngOnInit() {
    this.loadInitialData();
  
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
  
        console.log('Router NavigationEnd:', currentPath);
  
        // Check if current route is a risk assessment route
        this.isRiskAssessment = this.riskRoutes.includes(currentPath);
  
        // Signal that route check is complete
        this.routeReady$.next(true);
  
        // Expand/collapse menu logic based on current path
        this.expandMenu(currentPath);
  
        // Check whether session alert should stay active
        const stillValid = this.sessionAlertRoutes.includes(currentPath);
        if (!stillValid && this.sessionAlert) {
          console.log('Dismissing session alert due to route:', currentPath);
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
  console.log('ngAfterViewInit called');

  this.platform.ready().then(() => {
    console.log('Platform ready');

    this.isMobile = this.platform.is('mobile') || this.platform.is('mobileweb');
    console.log('Platform isMobile:', this.isMobile);

    this.isMenuOpen = !this.isMobile;
    console.log('Initial isMenuOpen set to:', this.isMenuOpen);

    this.cdr.detectChanges();

    if (this.isRouteCheckComplete && !this.initializedToggle) {
      this.initializedToggle = true;

      console.log('Calling initializeToggleRef from ngAfterViewInit...');
      setTimeout(() => this.initializeToggleRef(), 0);
    }
  });
}

initializeToggleRef() {
  const toggleRef = this.isMobile ? this.mobileToggle : this.desktopToggle;
  console.log('ToggleRef resolved:', toggleRef);

  if (toggleRef) {
    console.log('ToggleRef.checked at init:', toggleRef.nativeElement.checked);

    toggleRef.nativeElement.addEventListener('change', () => {
      this.isMenuOpen = toggleRef.nativeElement.checked;
      console.log('Menu toggled, isMenuOpen is now:', this.isMenuOpen);
    });
  } else {
    console.warn('ToggleRef is undefined — input element may not be rendered yet.');
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

    this.apiService.getSupportServiceDistances().subscribe({
      next: (distances) => {
        this.sharedDataService.setStateDistances(distances); // Updated to use menuService
      },
      error: (error) => {
        console.error('Failed to fetch support service distances:', error);
        this.sharedDataService.setStateDistances({}); // Fallback to empty object
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
