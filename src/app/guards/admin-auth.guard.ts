import { Injectable } from '@angular/core';
import {
  CanMatchFn,
  Router,
  Route,
  UrlSegment
} from '@angular/router';
import { inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

	canMatch: CanMatchFn = async (route: Route, segments: UrlSegment[]): Promise<boolean> => {
    try {
      // Get the latest authentication status
      const authStatus = await lastValueFrom(this.authService.getAuthStatusListener());
      const isAuth = authStatus.isAuthenticated;
      const role = authStatus.user?.role || '';

      // Generate the URL path based on the segments
      const isAdminRoute = segments.some(segment => segment.path === 'dashboard');
      const url = isAdminRoute ? `/admin/${segments.map((s) => s.path).join('/')}` : `/${segments.map((s) => s.path).join('/')}`;

      console.log('Generated URL:', url);

      // Check authentication and role conditions
      if (!isAuth) {
        await this.router.navigate(['/account/login'], { queryParams: { redirectUrl: url } });
        return false;
      } else if (role === 'user') {
        await this.router.navigate(['/account/wall'], { queryParams: { redirectUrl: url } });
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Error in AdminAuthGuard:', error);
      return false;
    }
  };
}
