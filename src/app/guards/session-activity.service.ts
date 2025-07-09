import { Injectable, NgZone } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom, Subject } from 'rxjs';
import { MenuService } from 'src/shared/menu.service';

@Injectable({ providedIn: 'root' })
export class SessionActivityService {
  private activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
  private warningTime = 55 * 60 * 1000; // 55 minutes
  private expiryTime = 60 * 60 * 1000; // 60 minutes
// private warningTime = 30 * 1000; // 40 seconds for testing
// private expiryTime = 50 * 1000;
private eventListenersBound = false;
private resetTimersBound = this.resetTimers.bind(this);
  private warningTimer: any;
  private logoutTimer: any;
  public broadcast = new BroadcastChannel('session_channel');
  public sessionWarning$ = new Subject<void>();
  public sessionExpired$ = new Subject<void>();
  public dismissPopup$ = new Subject<void>();

  constructor(private cookieService: CookieService, private ngZone: NgZone, private sharedDataService: MenuService) {
    this.broadcast.onmessage = (event) => {
  const { type } = event.data;

  this.ngZone.run(() => {
    if (type === 'sessionWarning') {
      this.sessionWarning$.next();
    } else if (type === 'sessionExpired') {
      this.sessionExpired$.next();
    } else if (type === 'dismissAlert') {
      // ✅ Emit event to trigger modal dismissal in all tabs
      this.dismissPopup$.next(); // <- you'll define this next
    }
  });
};
  }
 
  
  public async initializeTimers() {
  this.clearTimers();

  try {
    const configMap = await firstValueFrom(this.sharedDataService.config$);
    const sessionValueInMinutes = Number(configMap['sessionTimeoutValue']);
    this.expiryTime = sessionValueInMinutes * 60 * 1000;

    if (sessionValueInMinutes >= 5) {
      this.warningTime = this.expiryTime - 5 * 60 * 1000;
    } else if (sessionValueInMinutes >= 2) {
      this.warningTime = this.expiryTime - 1 * 60 * 1000;
    } else {
      this.warningTime = this.expiryTime - 30 * 1000;
    }

    if (this.warningTime < 10000) this.warningTime = this.expiryTime - 10000;

    this.startTracking();
  } catch (error) {
    this.startTracking();
  }
}

  private startTracking() {
  this.ngZone.runOutsideAngular(() => {
    if (!this.eventListenersBound) {
      this.activityEvents.forEach(event =>
        window.addEventListener(event, this.resetTimersBound, true)
      );
      this.eventListenersBound = true;
    } else {
    }
  });

  this.resetTimers(); // Always start fresh
}

  public resetSessionTimers() {
    this.resetTimers();
  }

 clearTimers() {
  clearTimeout(this.warningTimer);
  clearTimeout(this.logoutTimer);
}

private getTimestamp(): string {
  return new Date().toLocaleTimeString();
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
    this.broadcast.postMessage({ type: 'sessionWarning' });

    // ✅ Local trigger
    this.ngZone.run(() => {
      this.sessionWarning$.next();
    });
  }, this.warningTime);

  this.logoutTimer = setTimeout(() => {
    this.broadcast.postMessage({ type: 'sessionExpired' });
    this.broadcast.postMessage({ type: 'dismissAlert' });

    // ✅ Local trigger
    this.ngZone.run(() => {
      this.sessionExpired$.next();
      this.dismissPopup$.next();
    });
  }, this.expiryTime);
}
}
