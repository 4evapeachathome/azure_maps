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
  console.log('🔄 Broadcast received', type);

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
  console.log('Initializing timers');

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

    console.log('✅ Timers set', { expiry: this.expiryTime, warning: this.warningTime });
    this.startTracking();
  } catch (error) {
    console.log('❌ Failed to load config, using fallback timers', error);
    this.startTracking();
  }
}

  private startTracking() {
  this.ngZone.runOutsideAngular(() => {
    if (!this.eventListenersBound) {
      console.log('Binding user activity listeners');
      this.activityEvents.forEach(event =>
        window.addEventListener(event, this.resetTimersBound, true)
      );
      this.eventListenersBound = true;
    } else {
      console.log('Activity listeners already bound');
    }
  });

  this.resetTimers(); // Always start fresh
}

  public resetSessionTimers() {
    this.resetTimers();
  }

 clearTimers() {
  console.log('Clearing existing timers');
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

  console.log(`[${this.getTimestamp()}] 🟢 Activity detected - Resetting timers`);

  this.warningTimer = setTimeout(() => {
    console.log(`[${this.getTimestamp()}] ⚠️ Warning timer triggered`);
    this.broadcast.postMessage({ type: 'sessionWarning' });

    // ✅ Local trigger
    this.ngZone.run(() => {
      this.sessionWarning$.next();
    });
  }, this.warningTime);

  this.logoutTimer = setTimeout(() => {
    console.log(`[${this.getTimestamp()}] ⛔ Logout timer triggered`);
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
