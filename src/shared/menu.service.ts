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

}
