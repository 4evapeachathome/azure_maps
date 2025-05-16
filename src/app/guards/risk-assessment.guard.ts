import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class RiskAssessmentGuard implements CanActivate {
  constructor(private router: Router,private cookieService: CookieService,) {}

  
  canActivate(): boolean {
    const encodedUsername = this.cookieService.get('username');
    const loginTimestamp = parseInt(this.cookieService.get('loginTime'), 10);
  
    const currentTime = Date.now();
    const maxSessionDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
  
    if (encodedUsername && loginTimestamp) {
      try {
        const username = atob(encodedUsername);
  
        if (username && currentTime - loginTimestamp < maxSessionDuration) {
          return true;
        }
      } catch {
        // atob or parsing fails
      }
  
      this.cookieService.delete('username');
      this.cookieService.delete('loginTime');
    }
  
    this.router.navigate(['/loginPage']);
    return false;
  }

}
