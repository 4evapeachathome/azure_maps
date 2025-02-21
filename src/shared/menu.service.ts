import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuItemsSource = new BehaviorSubject<any[]>([]);
  menuItems$ = this.menuItemsSource.asObservable();

  setMenuItems(items: any[]) {
    this.menuItemsSource.next(items);
  }

  getMenuItems() {
    return this.menuItemsSource.value;
  }
}
