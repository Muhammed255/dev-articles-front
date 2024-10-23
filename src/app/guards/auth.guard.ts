import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuth = this.authService.getIsAuth();
    const role = localStorage.getItem('role');
    if (!isAuth) {
      this.router.navigate(["/login"], {
        queryParams: { redirectUrl: state.url },
      });
      return false;
    } else if (isAuth && role === "admin") {
      this.router.navigate(["/admin/dashboard"], {
        queryParams: { redirectUrl: state.url },
      });
      return false;
    } else {
      return true
    }
  }
}

@Injectable({
  providedIn: "root",
})
export class AdminAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuth = this.authService.getIsAuth();
    const role = localStorage.getItem('role');
    if (!isAuth) {
      this.router.navigate(["/login"], {
        queryParams: { redirectUrl: state.url },
      });
      return false;
    } else if (isAuth && role === "user") {
      this.router.navigate(["/account/home"], {
        queryParams: { redirectUrl: state.url },
      });
      return false;
    } else {
      return true;
    }
  }
}
