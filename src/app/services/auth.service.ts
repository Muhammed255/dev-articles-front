import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { ArticlePostService } from './article-post.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const BACKEND_URL = environment.backendUrl + '/auth/';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<any | null> = new BehaviorSubject<
    any | null
  >(null);
  public user$: Observable<any | null> = this.userSubject.asObservable();

  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: number;
  private authStatusListener = new BehaviorSubject<boolean>(false);
  private role: string;
	router = inject(Router);

  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
    private articleService: ArticlePostService
  ) {}

  getToken() {
    return this.token;
  }

  getRole() {
    return this.role;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getUserSubject() {
    return this.userSubject;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
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

  login(email: string, password: string) {
    const authData = { email: email, password: password };
    this.http
      .post<{
        success: boolean;
        msg: string;
        token: string;
        userId: number;
        user: any;
        role: string;
        expiresIn: number;
      }>(BACKEND_URL + 'login', authData)
      .subscribe({
        next: (data) => {
          const token = data.token;
          this.token = token;
          if (data.success) {
            this.userSubject.next(data.user);
            if (token) {
              const role = data.role;
              this.role = role;
              const expiresInDuration = data.expiresIn;
              this.setAuthTimer(expiresInDuration);
              this.isAuthenticated = true;
              this.userId = data.userId;
              this.authStatusListener.next(true);
              const now = new Date();
              const expirationDate = new Date(
                now.getTime() + expiresInDuration * 1000
              );
              console.log(expirationDate);
              this.saveAuthData(token, expirationDate, this.userId, this.role);
              this.snackBar.open(data.msg, 'Success', {
                duration: 3000,
              });
              if (role === 'admin') {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/account/home']);
              }
            }
          }
        },
        error: (err) => {
          this.snackBar.open(err.error.msg, 'Error', {
            duration: 3000,
          });
        },
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = Number(authInformation.userId);
      this.role = authInformation.role;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    } else {
      this.clearAuthData();
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.userId = null;
    this.authStatusListener.next(false);
    this.userSubject.next(null);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.snackBar.open('Logged out !!', 'Success', {
      duration: 3000,
    });
    this.router.navigate(['/account/wall']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: number,
    role: string
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('role', role);
  }

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

  findUserById(id: string) {
    return this.http
      .get<{ success: boolean; msg: string; user: any }>(BACKEND_URL + id)
      .subscribe((res) => {
        this.userSubject.next(res.user);
      });
  }

  findUserByUsername(username: string) {
    return this.http
      .get<{ success: boolean; msg: string; user: any }>(
        BACKEND_URL + 'user/' + username
      )
      .pipe(
        map((res) => {
          // this.userSubject.next(res.user);
          this.articleService.getPostSubListener().next({
            articles: res.user.articles,
            maxArticles: res.user.articles.length,
          });
          return res.user;
        }),
        tap((user) => {
          if (!user.articles) {
            user.articles = []; // Ensure articles property is initialized
          }
        })
      );
  }
}
