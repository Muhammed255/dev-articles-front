import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AddEditPostComponent } from 'src/app/admin-pages/add-edit-post/add-edit-post.component';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-user-pages',
  templateUrl: './user-pages.component.html',
  styleUrls: ['./user-pages.component.scss']
})
export class UserPagesComponent implements OnInit, OnDestroy {

  categories: any[] = [];
  auth_user: any;
  userImage = 'assets/faces/face-0.jpg';
  @ViewChild(MatMenuTrigger, {static: true}) topicsTriggerMenu: MatMenuTrigger;

	isAuth = false;

	private userSubscription: Subscription;
	private authSubscription: Subscription;

  constructor(
    public authService: AuthService,
    private catService: CategoryService,
		private cd: ChangeDetectorRef,
		private router: Router,
		public dialog: MatDialog
  ) {}

  ngOnInit() {
		this.getAllCategories();
		this.userSubscription = this.authService.user$.subscribe((user) => {
      this.auth_user = user;
      // this.authService.getUserSubject().next(data.user);
			this.cd.detectChanges();
    });
		this.authSubscription = this.authService.getAuthStatusListener().subscribe(isAuth => {
			console.log('====================================');
			console.log("user pages",isAuth);
			console.log('====================================');
			this.isAuth = isAuth;
			this.cd.detectChanges();
		})
  }


  ngAfterViewInit() {
  }

  getAllCategories() {
    this.catService.getTopicsByCategory().subscribe({
			next: (data) => {
				this.categories = data.topicsByCat;
			},
			error: (err) => {
				console.log('====================================');
				console.log(err);
				console.log('====================================');
			}
		});
  }

	openSettings(user: any) {
		this.router.navigate(["account", user.username, "settings"], {state: {user: user}})
  }

	addPostDialog() {
    const dialogRef = this.dialog.open(AddEditPostComponent, {
      width: '80rem',
      height: '60rem',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => typeof res === 'object'))
      .subscribe((result) => {
        console.log("DONE");
      });
  }

	ngOnDestroy(): void {
    console.log('UserPagesComponent destroyed');
		if(this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
		if(this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
  }

}
