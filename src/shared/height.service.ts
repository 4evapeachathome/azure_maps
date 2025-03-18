import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeightService {
  private heightSource = new BehaviorSubject<number>(250); 
  currentHeight = this.heightSource.asObservable();

  updateHeight(height: number) {
    this.heightSource.next(height);
  }
}
