import { Injectable, NgZone } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionActivityService {
  private activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
  private warningTime = 55 * 60 * 1000; // 55 minutes
  private expiryTime = 60 * 60 * 1000; // 60 minutes
// private warningTime = 40 * 1000; // 40 seconds for testing
// private expiryTime = 60 * 1000;
  private warningTimer: any;
  private logoutTimer: any;

  public sessionWarning$ = new Subject<void>();
  public sessionExpired$ = new Subject<void>();

  constructor(private cookieService: CookieService, private ngZone: NgZone) {
    this.startTracking();
  }

  private startTracking() {
    this.ngZone.runOutsideAngular(() => {
      this.activityEvents.forEach(event =>
        window.addEventListener(event, this.resetTimers.bind(this))
      );
    });

    this.resetTimers(); // Initialize
  }

  public resetSessionTimers() {
    this.resetTimers();
  }

  clearTimers() {
    clearTimeout(this.warningTimer);
    clearTimeout(this.logoutTimer);
  }

  private resetTimers() {
    const now = Date.now().toString();
    this.cookieService.set('loginTime', now, {
      path: '/',
      sameSite: 'Strict',
      secure: true,
    });

   this.clearTimers();

    this.warningTimer = setTimeout(() => {
      this.ngZone.run(() => this.sessionWarning$.next());
    }, this.warningTime);

    this.logoutTimer = setTimeout(() => {
      this.ngZone.run(() => this.sessionExpired$.next());
    }, this.expiryTime);
  }
}
