import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpResponse,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  // intercept(req: HttpRequest<any>, next: HttpHandler) {
  //   return next.handle(authRequest);
  // }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = this.authService.getStoredAuthData()?.token;

    let authRequest = request;
    if (authToken) {
      authRequest = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + authToken),
      });
    }

    return next.handle(authRequest).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Check if response contains a new token
          const newToken = event.headers.get('New-Access-Token');
          if (newToken) {
            this.authService.updateToken(newToken);
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle token expiration
          this.authService.logout(); // Clear tokens and redirect to login
        }
        return throwError(() => error);
      })
    );
  }
}
