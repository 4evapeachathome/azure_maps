import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  //Menu items as shared service
  private menuItemsSource = new BehaviorSubject<any[]>([]);
  menuItems$ = this.menuItemsSource.asObservable();

  //Service filter options as shared service
  private filterOptionsSubject = new BehaviorSubject<any[]>([]);
  private organizationsSubject = new BehaviorSubject<any[]>([]);

  filterOptions$ = this.filterOptionsSubject.asObservable();
  organizations$ = this.organizationsSubject.asObservable();

  private showAdditionalMenusSource = new BehaviorSubject<boolean>(false);
  showAdditionalMenus$ = this.showAdditionalMenusSource.asObservable();

  private loggedInUser = new BehaviorSubject<any | null>(null);
  loggedInUser$ = this.loggedInUser.asObservable();


  setMenuItems(items: any[]) {
    this.menuItemsSource.next(items);
  }

  getMenuItems() {
    return this.menuItemsSource.value;
  }

 
  toggleAdditionalMenus(show: boolean) {
    this.showAdditionalMenusSource.next(show);
  }


  setFilterOptions(options: any[]) {
    this.filterOptionsSubject.next(options);
  }

  setOrganizations(orgs: any[]) {
    this.organizationsSubject.next(orgs);
  }

  setLoggedInUser(user: any) {
    this.loggedInUser.next(user);
  }

  getLoggedInUser() {
    return this.loggedInUser.getValue();
  }

  clearLoggedInUser() {
    this.loggedInUser.next(null);
  }

}
