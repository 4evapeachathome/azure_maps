import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RiskAssessmentGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const encodedUsername = sessionStorage.getItem('username');
if (encodedUsername) {
  const username = atob(encodedUsername);
  return true;
} else {
  return this.router.parseUrl('/loginPage');
}
  }
}
