import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { ArticlePostService } from './article-post.service';
import { MatSnackBar } from '@angular/material/snack-bar';



interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface LoginResponse {
  success: boolean;
  msg: string;
  token: string;
  user: any;
  expiresIn: number;
}



const BACKEND_URL = environment.backendUrl + '/auth/';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenExpirationTimer?: number;

  // Single source of truth for auth state
  private readonly authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  // Public observables
  readonly user$ = this.authState.pipe(map(state => state.user));
  readonly isAuthenticated$ = this.authState.pipe(map(state => state.isAuthenticated));
  readonly token$ = this.authState.pipe(map(state => state.token));

	private readonly TOKEN_DURATION = 86400;

  // Inject dependencies
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor(
    // private http: HttpClient,
    // public snackBar: MatSnackBar,
    private articleService: ArticlePostService
  ) {
		// this.autoLogin()
	}


	getUserId(): string | null {
    return this.authState.value.user?._id || null;
  }

  getUserRole(): string | null {
    return this.authState.value.user?.role || null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole !== null && roles.includes(userRole);
  }

  getToken() {
    return this.authState.value.token || null;
  }

  // getRole() {
  //   return this.role;
  // }

  getIsAuth() {
    return this.authState.value.isAuthenticated;
  }

  // getUserId() {
  //   return this.userId;
  // }

  getUserSubject() {
    return this.authState;
  }

	getUserState(newUserValues) {
    return this.authState.next({...this.authState.value, user: newUserValues});
  }

  getAuthStatusListener() {
    return this.authState.asObservable();
  }

  createUser(
    name: string,
    username: string,
    email: string,
    password: string,
    bio: string
  ) {
    const authData = { name, username, email, password, bio };

    return this.http.post<{ success: boolean; msg: string; result: any }>(
      BACKEND_URL + 'signup',
      authData
    );
  }

  adminSignup(
    name: string,
    username: string,
    email: string,
    password: string,
    bio: string
  ) {
    const authData = { name, username, email, password, bio };

    return this.http.post<{ success: boolean; msg: string; result: any }>(
      BACKEND_URL + 'admin-signup',
      authData
    );
  }

	login(email: string, password: string): Observable<void> {
    return new Observable(subscriber => {
      this.http.post<LoginResponse>(`${BACKEND_URL}login`, { email, password })
        .subscribe({
          next: (response) => {
            if (response.success && response.token) {
              this.handleAuthSuccess(response);
              subscriber.next();
              subscriber.complete();
            }
          },
          error: (error) => {
            this.showError(error.error?.msg || 'Authentication failed');
            subscriber.error(error);
          }
        });
    });
  }

	private handleAuthSuccess(response: LoginResponse): void {
    const expirationDate = new Date(new Date().getTime() + response.expiresIn * 1000);

    // Update auth state
    this.authState.next({
      user: response.user,
      token: response.token,
      isAuthenticated: true
    });

    // Store auth data
    this.saveAuthData({
      token: response.token,
      userId: response.user._id,
      expirationDate: expirationDate.toISOString()
    });

    // Set expiration timer
    this.setExpirationTimer(response.expiresIn * 1000);

    // Show success message
    this.showSuccess(response.msg || 'Login successful');

    // Navigate based on role
    if (response.user.role === 'admin') {
			this.router.navigate(['/admin/dashboard']);
		} else {
			this.router.navigate(['/account/home']);
		}
  }


	private clearTokenTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
			this.tokenExpirationTimer = null;
    }
  }

	async autoLogin(): Promise<void> {
		const authData = this.getStoredAuthData();

		if (!authData) {
			this.clearTokenTimer();
			this.router.navigate(['/account/login']);
			return;
		}

		const { token, userId, expirationDate } = authData;
		const expirationTime = new Date(expirationDate).getTime() - Date.now();

		if (expirationTime > 0) {
			try {
				const user = await firstValueFrom(this.findUserById(userId))
				this.updateAuthStateWithUser({isAuthenticated: true, token: token, user});
				this.saveAuthData({ expirationDate: new Date(expirationDate).toISOString(), token, userId: user._id });
				this.setExpirationTimer(expirationTime);
				console.log('Ended (after successful auto-login)');
			} catch (error) {
				console.error('Error during auto-login:', error);
				this.logout();
			}
		} else {
			this.authState.next({
				user: null,
				token: null,
				isAuthenticated: false,
			});
			console.log('Ended (token expired)');
		}
	}

	// autoLogin(): void {
	// 	const authData = this.getStoredAuthData();

	// 	console.log('====================================');
	// 	console.log(authData);
	// 	console.log('====================================');

	// 	if (!authData) {
	// 		this.clearTokenTimer();
	// 		this.router.navigate(['/account/login']);
	// 		return;
	// 	}

	// 	const { token, userId, expirationDate } = authData;
	// 	const expirationTime = new Date(expirationDate).getTime() - Date.now();

	// 	console.log('====================================');
	// 	console.log("Expire", expirationTime);
	// 	console.log('====================================');

	// 	if (expirationTime > 0) {
	// 		console.log('====================================');
	// 		console.log("here!!!!!!!!!!");
	// 		console.log('====================================');

	// 		this.findUserById(userId)
	// 			.pipe(
	// 				tap((user) => {
	// 					console.log('====================================');
	// 					console.log("Auto login user", user);
	// 					console.log('====================================');

	// 					// Update the auth state with the user info

	// 					this.saveAuthData({ expirationDate: new Date(expirationDate).toISOString(), token, userId: user._id})
	// 					// Log state after updating
	// 					console.log('====================================');
	// 					console.log("Before end", this.authState.value.isAuthenticated);
	// 					console.log('====================================');
	// 					return this.authState.next({
	// 						user: user,
	// 						token: token,
	// 						isAuthenticated: true,
	// 					});
	// 				}),
	// 				catchError((error) => {
	// 					console.log(error);
	// 					return EMPTY;
	// 				})
	// 			)
	// 			.subscribe({
	// 				next: (user) => {
	// 					this.saveAuthData({ expirationDate: new Date(expirationDate).toISOString(), token, userId: user._id})
	// 				},
	// 				complete: () => {
	// 					this.setExpirationTimer(expirationTime);

	// 					// Log the state after completing the subscription
	// 					console.log('====================================');
	// 					console.log("After end", this.authState.value.isAuthenticated);
	// 					console.log('====================================');
	// 				},
	// 			});
	// 	} else {
	// 		console.log('====================================');
	// 		console.log();
	// 		console.log('====================================');
	// 		this.authState.next({
	// 			user: null,
	// 			token: null,
	// 			isAuthenticated: false,
	// 		});

	// 		// Log the state for the expired scenario
	// 		console.log('====================================');
	// 		console.log("After end (expired)", this.authState.value.isAuthenticated);
	// 		console.log('====================================');
	// 	}

	// 	// Final log indicating the function has ended
	// 	console.log("Ended", this.authState.value.isAuthenticated);
	// }


  private setExpirationTimer(duration: number): void {
    this.tokenExpirationTimer = window.setTimeout(() => {
      this.logout();
    }, duration);
  }

  private saveAuthData(data: { token: string; userId: string; expirationDate: string }): void {
    localStorage.setItem('authData', JSON.stringify(data));
  }

  getStoredAuthData(): { token: string; userId: string; expirationDate: string } | null {
    const data = localStorage.getItem('authData');
    return data ? JSON.parse(data) : null;
  }

  private clearStoredAuthData(): void {
    localStorage.removeItem('authData');
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  // login(email: string, password: string) {
  //   const authData = { email: email, password: password };
  //   this.http
  //     .post<{
  //       success: boolean;
  //       msg: string;
  //       token: string;
  //       userId: string;
  //       user: any;
  //       role: string;
  //       expiresIn: number;
  //     }>(BACKEND_URL + 'login', authData)
  //     .subscribe({
  //       next: (data) => {
  //         const token = data.token;
  //         this.token = token;
  //         if (data.success) {
  //           this.userSubject.next(data.user);
  //           if (token) {
  //             const role = data.role;
  //             this.role = role;
  //             const expiresInDuration = data.expiresIn;
  //             this.setAuthTimer(expiresInDuration);
  //             this.isAuthenticated = true;
  //             this.userId = data.userId;
  //             this.authStatusListener.next(true);
  //             const now = new Date();
  //             const expirationDate = new Date(
  //               now.getTime() + expiresInDuration * 1000
  //             );
  //             console.log(expirationDate);
  //             this.saveAuthData(token, expirationDate, this.userId, this.role);
  //             this.snackBar.open(data.msg, 'Success', {
  //               duration: 3000,
  //             });
  //             if (role === 'admin') {
  //               this.router.navigate(['/admin/dashboard']);
  //             } else {
  //               this.router.navigate(['/account/home']);
  //             }
  //           }
  //         }
  //       },
  //       error: (err) => {
  //         this.snackBar.open(err.error.msg, 'Error', {
  //           duration: 3000,
  //         });
  //       },
  //     });
  // }

  // autoAuthUser() {
  //   const authInformation = this.getAuthData();
  //   if (!authInformation) {
  //     return;
  //   }
  //   const now = new Date();
  //   const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
  //   if (expiresIn > 0) {
  //     this.token = authInformation.token;
  //     this.isAuthenticated = true;
  //     this.userId = authInformation.userId;
  //     this.role = authInformation.role;
  //     this.setAuthTimer(expiresIn / 1000);
  //     this.authStatusListener.next(true);
  //   } else {
  //     this.clearAuthData();
  //   }
  // }

	logout(): void {
    // Clear auth state
    this.authState.next({
      user: null,
      token: null,
      isAuthenticated: false
    });

    // Clear stored data
    this.clearStoredAuthData();

    // Clear timer
    if (this.tokenExpirationTimer) {
      window.clearTimeout(this.tokenExpirationTimer);
    }

    // Navigate to login
    this.router.navigate(['/login']);
  }

  // logout() {
  //   this.http
  //     .get<{ success: boolean; message: string }>(BACKEND_URL + '/logout')
  //     .subscribe({
  //       next: (res) => {
  //         if (res.success) {
  //         }
  //         this.token = null;
  //         this.isAuthenticated = false;
  //         this.userId = null;
  //         this.authStatusListener.next(false);
  //         this.userSubject.next(null);
  //         clearTimeout(this.tokenTimer);
  //         this.clearAuthData();
  //         this.snackBar.open(res.message, 'Success', {
  //           duration: 3000,
  //         });
  //         this.router.navigate(['/account/wall']);
  //       },
  //     });
  // }

	updateToken(newToken: string): void {
    const currentState = this.authState.value;

    if (!currentState.isAuthenticated || !currentState.user) {
      console.warn('Attempted to update token while not authenticated');
      return;
    }

    // Update the auth state with new token
    this.authState.next({
      ...currentState,
      token: newToken
    });

    // Calculate new expiration date
    const expirationDate = new Date(new Date().getTime() + this.TOKEN_DURATION * 1000);

    // Save updated auth data
    this.saveAuthData({
      token: newToken,
      userId: currentState.user._id,
      expirationDate: expirationDate.toISOString()
    });

    // Reset expiration timer
    if (this.tokenExpirationTimer) {
      window.clearTimeout(this.tokenExpirationTimer);
    }
    this.setExpirationTimer(this.TOKEN_DURATION * 1000);

    // Show success notification
    this.showSuccess('Token updated successfully');
  }

  // private setAuthTimer(duration: number) {
  //   console.log('Setting timer: ' + duration);
  //   this.tokenExpirationTimer = setTimeout(() => {
  //     this.logout();
  //   }, duration * 1000);
  // }

  // private saveAuthData(
  //   token: string,
  //   expirationDate: Date,
  //   userId: string,
  //   role: string
  // ) {
  //   localStorage.setItem('token', token);
  //   localStorage.setItem('expiration', expirationDate.toISOString());
  //   localStorage.setItem('userId', userId.toString());
  //   localStorage.setItem('role', role);
  // }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      role: role,
    };
  }

  getAuthProfile() {
    return this.http.get<{ success: boolean; msg: string; user: any }>(
      BACKEND_URL + 'profile'
    );
  }

  getUserProfile(username: string) {
    return this.http.get<{ user: any }>(BACKEND_URL + username);
  }

  getUsers() {
    return this.http.get<{ users: any[] }>(BACKEND_URL + 'all-users');
  }

	findUserById(id: string): Observable<any | null> {
		return this.http.get<{ success: boolean, msg: string, user: any }>(`${BACKEND_URL}${id}`).pipe(
			map(response => {
				if (!response.success) {
					throw new Error(response.msg);
				}
				return response.user;
			}),
			take(1),
			tap(user => this.updateAuthStateWithUser({...this.authState.value, user})),
			catchError(error => {
				console.error('Error in findUserById:', error);
				return this.handleError(error);
			})
		);
	}

	private updateAuthStateWithUser(data): void {
		this.authState.next({
			...data
		});
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (typeof error.error === 'object' && error.error !== null) {
      errorMessage = error.error.msg || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    this.showError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // findUserById(id: string) {
  //   return this.http
  //     .get<{ success: boolean; msg: string; user: any }>(BACKEND_URL + id)
  //     .pipe(
  //       map((response) => response.user),
  //       tap((user) => this.userSubject.next(user)),
  //       catchError((error) => {
  //         console.error('Error fetching user:', error);
  //         // Either rethrow the error or return a default value
  //         throw error;
  //         // OR return a default value:
  //         // return of(null);
  //       })
  //     );
  // }

  findUserByUsername(username: string) {
    return this.http
      .get<{
        success: boolean;
        msg: string;
        data: { user: any; articles: any[] };
      }>(BACKEND_URL + 'user/' + username)
      .pipe(
        map((res) => {
          // this.userSubject.next(res.user);
          this.articleService.getPostSubListener().next({
            articles: res.data.user.articles,
            maxArticles: res.data.user?.articles?.length,
          });
          return res.data;
        }),
        tap((data) => {
          if (!data.articles) {
            data.articles = []; // Ensure articles property is initialized
          }
        })
      );
  }
}
