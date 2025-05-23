import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuItemsSource = new BehaviorSubject<any[]>([]);
  menuItems$ = this.menuItemsSource.asObservable();

  private filterOptionsSubject = new BehaviorSubject<any[]>([]);
  private organizationsSubject = new BehaviorSubject<any[]>([]);

  filterOptions$ = this.filterOptionsSubject.asObservable();
  organizations$ = this.organizationsSubject.asObservable();

  private showAdditionalMenusSource = new BehaviorSubject<{ show: boolean, sectionTitle: string | null }>({
    show: false,
    sectionTitle: null
  });
  
  showAdditionalMenus$ = this.showAdditionalMenusSource.asObservable();
  
  private _lastExpandedSection: string | null = null;

  get lastExpandedSection(): string | null {
    return this._lastExpandedSection;
  }

  set lastExpandedSection(value: string | null) {
    this._lastExpandedSection = value;
  }

toggleAdditionalMenus(show: boolean, sectionTitle: string | null = null) {
  // Prevent re-emitting the same section
  //debugger;
  if (this.lastExpandedSection === sectionTitle && show) {
    return;
  }

  this.lastExpandedSection = sectionTitle;

  this.showAdditionalMenusSource.next({ show, sectionTitle });
}

  setMenuItems(items: any[]) {
    this.menuItemsSource.next(items);
  }

  getMenuItems() {
    return this.menuItemsSource.value;
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

    //Hits Assessment
    private hitsAssessmentData: any[] | null = null;

    setHitsAssessment(data: any[]) {
      this.hitsAssessmentData = data;
    }
  
    getHitsAssessment(): any[] | null {
      return this.hitsAssessmentData;
    }
  
    clearHitsAssessment() {
      this.hitsAssessmentData = null;
    }

}
