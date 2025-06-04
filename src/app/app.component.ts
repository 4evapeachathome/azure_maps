import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { Location } from '@angular/common';
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
  showSessionWarning = false;
  isMenuOpen = true;
  public readonly endPoint : string = APIEndpoints.supportService;
  private hasHandledReload = false;
  private riskRoutes = ['riskassessment', 'usercreation', 'riskassessmentsummary','login','hitsassessment', 'ratsassessment', 'daAssessment'];

  constructor(
    private sessionActivityService: SessionActivityService,
    private alertController: AlertController,
    private cookieService: CookieService,
    private platform: Platform,
    private location:Location,
    private router: Router,
    private apiService: ApiService,
    private sharedDataService: MenuService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const currentPath = url.split('/')[1]?.split('?')[0];
  
        this.isRiskAssessment = this.riskRoutes.includes(currentPath);
        this.isRouteCheckComplete = true;
  
        // // Store or clear last risk URL based on current route
        // if (this.isRiskAssessment) {
        //   localStorage.setItem('lastRiskAssessmentUrl', url);
        // } else {
        //   localStorage.removeItem('lastRiskAssessmentUrl');
        // }
  
        // // Handle page reload only once
        // if (!this.hasHandledReload) {
        //   this.hasHandledReload = true;
  
        //   const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        //   const isReload = navigationEntries.length > 0 && navigationEntries[0].type === "reload";
  
        //   if (isReload) {
        //     const lastRiskUrl = localStorage.getItem('lastRiskAssessmentUrl');
  
        //     if (
        //       lastRiskUrl &&
        //       this.riskRoutes.includes(lastRiskUrl.split('/')[1]) &&
        //       this.isValidSession()
        //     ) {
        //       if (url !== lastRiskUrl) {
        //         this.router.navigateByUrl(lastRiskUrl);
        //       }
        //     } else {
        //       if (url !== '/home') {
        //         this.router.navigate(['/home']);
        //       }
        //     }
        //   }
        // }
      });
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
  
    if (Capacitor.isNativePlatform()) {
      this.platform.ready().then(() => {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setStyle({ style: Style.Dark });
      });
    }
  
    this.isMobile = this.platform.is('mobile') || this.platform.is('mobileweb');
  
    this.sessionActivityService.sessionWarning$.subscribe(() => {
      if (this.shouldShowSessionAlert()) {
        this.presentSessionAlert();
      }
    });
  
    this.sessionActivityService.sessionExpired$.subscribe(() => {
      if (this.isUserLoggedIn()) {
        this.logout();
      }

      if (this.sessionAlert) {
        this.sessionAlert.dismiss();
        this.sessionAlert = null;
      }
    });

    this.router.events.subscribe(() => {
      const currentPath = this.location.path();
      const stillValid = ['/riskassessment', '/hitsassessment', '/riskassessmentsummary', '/ratsassessment', '/daAssessment']
        .some(route => currentPath.startsWith(route));
    
      if (!stillValid && this.sessionAlert) {
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
    '/ratsassessment',
    '/daAssessment'
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
   // debugger;
    if (this.isMobile && this.mobileToggle?.nativeElement.checked) {
      this.mobileToggle.nativeElement.checked = false;
      this.isMenuOpen = false;
    }
  }

  ngOnDestroy() {
  }
}
