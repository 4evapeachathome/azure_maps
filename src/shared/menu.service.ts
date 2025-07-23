import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PageTitleService } from 'src/app/services/page-title.service';
import { environment } from 'src/environments/environment';

export interface StateDistance {
  Abbreviation: string;
  Miles: string | number;
}

export interface StateDistanceResponse {
  data: StateDistance[];
  meta?: any;
}
   //Hits Assessment
   interface HitsAssessmentData {
    questions: any[];
    answerOptions: any[];
  }

   interface RatsAssessmentData {
    questions: any[];
    answerOptions: any[];
  }

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly storageKey = 'menuItems';

  private filterOptionsSubject = new BehaviorSubject<any[]>([]);
  private organizationsSubject = new BehaviorSubject<any[]>([]);

  filterOptions$ = this.filterOptionsSubject.asObservable();
  organizations$ = this.organizationsSubject.asObservable();


  private contentHeightSubject = new BehaviorSubject<number>(0);
  contentHeight$ = this.contentHeightSubject.asObservable();

    //Config
  private configSubject = new BehaviorSubject<any>(null);
  config$ = this.configSubject.asObservable();

   private ratsAssessmentData: RatsAssessmentData | null = null;
  private ssripaDataSubject = new BehaviorSubject<any[] | null>(null);

  private showAdditionalMenusSource = new BehaviorSubject<{ show: boolean, sectionTitle: string | null }>({
    show: false,
    sectionTitle: null
  });

  private menuLoadedSubject = new BehaviorSubject<boolean>(false);
menuLoaded$ = this.menuLoadedSubject.asObservable();

  
  showAdditionalMenus$ = this.showAdditionalMenusSource.asObservable();
  
  private _lastExpandedSection: string | null = null;

  get lastExpandedSection(): string | null {
    return this._lastExpandedSection;
  }

  set lastExpandedSection(value: string | null) {
    this._lastExpandedSection = value;
  }

      private dataLoadedSubject = new BehaviorSubject<boolean>(false);
dataLoaded$ = this.dataLoadedSubject.asObservable();


      private hitsAssessmentData: HitsAssessmentData | null = null;

      googleMapsLoadedPromise!: Promise<void>;
private googleMapsResolver!: () => void;
googleMapsReady = false;

  constructor(
    private alertController: AlertController,
    private cookieService: CookieService,
    private router: Router,
    private analytics: PageTitleService // Replace with actual analytics service type
  ) {
     this.googleMapsLoadedPromise = new Promise<void>((resolve) => {
    this.googleMapsResolver = resolve;
  });
  }
  


  setContentHeight(height: number) {
    this.contentHeightSubject.next(height);
  }



setConfig(config: any) {
  this.configSubject.next(config);
}

 

toggleAdditionalMenus(show: boolean, sectionTitle: string | null = null) {
  // Prevent re-emitting the same section
  
  if (this.lastExpandedSection === sectionTitle && show) {
    return;
  }

  this.lastExpandedSection = sectionTitle;

  this.showAdditionalMenusSource.next({ show, sectionTitle });
}

setMenuItems(menuItems: any[]): void {
  try {
    sessionStorage.setItem(this.storageKey, JSON.stringify(menuItems));
  } catch (e) {
    console.error('Error saving menu items to sessionStorage', e);
  }
}

// Get menu items from sessionStorage
getMenuItems(): any[] {
  try {
    const menuItemsStr = sessionStorage.getItem(this.storageKey);
    return menuItemsStr ? JSON.parse(menuItemsStr) : [];
  } catch (e) {
    console.error('Error reading menu items from sessionStorage', e);
    return [];
  }
}

// Clear menu items from sessionStorage
clearMenuItems(): void {
  sessionStorage.removeItem(this.storageKey);
}

  setFilterOptions(options: any[]) {
    this.filterOptionsSubject.next(options);
  }

  setOrganizations(orgs: any[]) {
    this.organizationsSubject.next(orgs);
  } 

  //Menu inital load

    get hasAppLoadedOnce(): boolean {
      return sessionStorage.getItem('appLoadedOnce') === 'true';
    }
  
    set hasAppLoadedOnce(value: boolean) {
      sessionStorage.setItem('appLoadedOnce', value ? 'true' : 'false');
    }
    
    setHitsAssessment(data: HitsAssessmentData) {
      this.hitsAssessmentData = data;
    }
    
    getHitsAssessment(): HitsAssessmentData | null {
      return this.hitsAssessmentData;
    }

    //Ssripa Assessment
    setSsripaData(data: any[]) {
      this.ssripaDataSubject.next(data); // Emit new data
    }

    private dangerAssessment:any;
    setDangerAssessment(data: any) {
      this.dangerAssessment = data;
    }
    
    getDangerAssessment(): any | null {
      return this.dangerAssessment;
    }
  
    getSsripaData(): Observable<any[] | null> {
      return this.ssripaDataSubject.asObservable(); // Return as Observable
    }
  
    getSsripaDataValue(): any[] | null {
      return this.ssripaDataSubject.getValue(); // Get current value synchronously
    }
  
    clearSsripaData() {
      this.ssripaDataSubject.next(null); // Clear data
    }


    setRatsAssessment(data: RatsAssessmentData) {
      this.ratsAssessmentData = data;
    }
    
    getRatsAssessment(): RatsAssessmentData | null {
      return this.ratsAssessmentData;
    }

  private stateDistancesSubject = new BehaviorSubject<StateDistanceResponse | null>(null);

stateDistances$ = this.stateDistancesSubject.asObservable();

setStateDistances(distances: StateDistanceResponse) {
  this.stateDistancesSubject.next(distances);
}

getStateDistances(): Observable<StateDistanceResponse | null> {
  return this.stateDistancesSubject.asObservable();
}

getStateDistancesValue(): StateDistanceResponse | null {
  return this.stateDistancesSubject.getValue();
}

setDataLoaded(loaded: boolean) {
  this.dataLoadedSubject.next(loaded);
}

// menu.service.ts

setMenuLoaded(loaded: boolean) {
  this.menuLoadedSubject.next(loaded);
}

//googlemaps
resolveGoogleMapsLoaded() {
  this.googleMapsReady = true; // used in components
  this.googleMapsResolver();   // resolves the Promise for `await`
}
    
  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: () => {

            // Tracking logout event with Google Analytics
           this.analytics.trackLogout();
            // this.guidedType = 'staff-guided';
            this.cookieService.delete('username');
            this.cookieService.delete('loginTime');
            this.cookieService.delete('userdetails');
            sessionStorage.clear();
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
  
    await alert.present();
  }

}
