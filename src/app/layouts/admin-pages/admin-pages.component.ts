import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AddEditPostComponent } from 'src/app/admin-pages/add-edit-post/add-edit-post.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-pages',
  templateUrl: './admin-pages.component.html',
  styleUrls: ['./admin-pages.component.scss'],
})
export class AdminPagesComponent implements OnInit, OnDestroy {
  auth_user: any;
  menu = 'vertical';
  user: any | null = null;
  private userSubscription: Subscription;

  toggleSearchBar = false;

  constructor(
    private cd: ChangeDetectorRef,
    public authService: AuthService,
    public dialog: MatDialog,
		private router: Router
  ) {}

  ngOnInit() {
		if(localStorage.getItem('userId')) {
			this.authService.findUserById(localStorage.getItem('userId'))
			this.userSubscription = this.authService.user$.subscribe((user) => {
				this.auth_user = user;
				// this.authService.getUserSubject().next(data.user);
				this.cd.detectChanges();
				console.log('Change detection triggered!');
			});
		}
  }

	openSettings(user: any) {
		this.router.navigate(["admin", user.username, "settings"], {state: {user: user}})
  }

  addPostDialog() {
    const dialogRef = this.dialog.open(AddEditPostComponent, {
      width: '100%',
      height: '44rem',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => typeof res === 'object'))
      .subscribe((result) => {
        console.log(result);
      });
  }

  ngOnDestroy(): void {
    console.log('AdminPagesComponent destroyed');
    this.userSubscription.unsubscribe();
  }
}
