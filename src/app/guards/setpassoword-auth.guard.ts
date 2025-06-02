// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { Observable, of } from 'rxjs';
// import { ApiService } from '../services/api.service';
// import { catchError, map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root',
// })
// export class UserCreationAuthGuard implements CanActivate {
//   constructor(private apiService: ApiService, private router: Router) {}

//   // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
//   //   const uid = route.queryParamMap.get('uid');

//   //   if (!uid) {
//   //     this.router.navigate(['/login']);
//   //     return of(false);
//   //   }
//     // return this.apiService.getUserLoginById(uid).pipe(
//     //   map((user) => {
//     //     if (!user) {
//     //       console.warn('⛔ User not found for uid:', uid);
//     //       this.router.navigate(['/login']);
//     //       return false;
//     //     }

//     //     if (user.IsPasswordChanged === true) {
//     //       console.warn('⛔ Password already changed');
//     //       this.router.navigate(['/login']);
//     //       return false;
//     //     }

//     //     return true; // ✅ Allow access
//     //   }),
//     //   catchError((err) => {
//     //     console.error('AuthGuard error:', err);
//     //     this.router.navigate(['/login']);
//     //     return of(false);
//     //   })
//     // );
//   }
// }
