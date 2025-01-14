import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  concatMap,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> => {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
				console.log('====================================');
				console.log("IS AUTH", this.authService.getUserId(), this.authService.getToken(), this.authService.getUserRole());
				console.log('====================================');
        if (!isAuthenticated) {
          this.router.navigate(['/account/login'], {
            queryParams: { redirectUrl: state.url },
          });
          return false;
        }

        if (this.authService.getUserRole() === 'admin') {
          this.router.navigate(['/admin/dashboard'], {
            queryParams: { redirectUrl: state.url },
          });
          return false;
        }

        return true;
      })
    );
  };

  // canActivate: CanActivateFn = (
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<boolean> | boolean => {
  // 	console.log('====================================');
  // 	console.log("SDFSDFSDFSDFs", this.authService.getIsAuth());
  // 	console.log('====================================');
  // 	return this.authService.getIsAuth()
  // this.authService.getAuthStatusListener().subscribe({
  // 	next: (isAuth) => {
  // 		console.log('====================================');
  // 		console.log("IS AUTH", isAuth);
  // 		console.log('====================================');
  // 	}
  // })
  // return this.authService.getAuthStatusListener()
  // .pipe((authState) => {
  // 			console.log('====================================');
  // 			console.log("authState", authState);
  // 			console.log('====================================');
  // 			if (!authState.isAuthenticated) {
  // 				this.router.navigate(['/account/login'], { queryParams: { redirectUrl: state.url } });
  // 				return false;
  // 			}

  // 			if (authState.user?.role === 'admin') {
  // 				this.router.navigate(['/admin/dashboard'], { queryParams: { redirectUrl: state.url } });
  // 				return false;
  // 			}
  // 			return true;
  // 	})
  // };
}
