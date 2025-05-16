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

    if (encodedUsername) {
      try {
        const username = atob(encodedUsername);
        if (username) return true;
      } catch {
        // if atob fails
        this.cookieService.delete('username');
      }
    }

    this.router.navigate(['/loginPage']);
    return false;
  }

}
