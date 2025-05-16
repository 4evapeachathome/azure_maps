import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(): boolean {
    const encodedUsername = this.cookieService.get('username');
    const loginTimestamp = parseInt(this.cookieService.get('loginTime'), 10);
    const currentTime = Date.now();
    const maxSessionDuration = 60 * 60 * 1000; // 60 mins

    if (encodedUsername && loginTimestamp) {
      try {
        const username = atob(encodedUsername);
        const notExpired = currentTime - loginTimestamp < maxSessionDuration;

        if (username && notExpired) {
          const lastRiskUrl = localStorage.getItem('lastRiskAssessmentUrl') || '/riskassessment';
          this.router.navigateByUrl(lastRiskUrl);
          return false;
        }
      } catch {
        this.cookieService.delete('username');
        this.cookieService.delete('loginTime');
      }
    }

    return true; // allow navigation to loginPage if not logged in or expired
  }
}
