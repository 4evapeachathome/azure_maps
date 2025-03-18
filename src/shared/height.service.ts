import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeightService {
  private gridHeightSubject = new BehaviorSubject<{ height: number; isReady: boolean }>({ height: 250, isReady: false });
  gridHeight$ = this.gridHeightSubject.asObservable();

  setGridHeight(height: number) {
    this.gridHeightSubject.next({ height, isReady: true });
  }
}