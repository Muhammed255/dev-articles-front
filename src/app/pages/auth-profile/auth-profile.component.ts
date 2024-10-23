import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArticlePostService } from 'src/app/services/article-post.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import { AddEditPostComponent } from 'src/app/admin-pages/add-edit-post/add-edit-post.component';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { UsersListComponent } from '../components/users-list/users-list.component';

@Component({
  selector: 'app-auth-profile',
  templateUrl: './auth-profile.component.html',
  styleUrls: ['./auth-profile.component.scss'],
})
export class AuthProfileComponent implements OnInit, OnDestroy {
  user: any;
  articles: any[];
  isLoading = false;
  auth_user: any;
  isFollowingProfileUser = false;

  showButtons: boolean = false;
  role = localStorage.getItem('role');

  articleSubListener: Subscription;
  private userSubscription: Subscription;

  constructor(
    public authService: AuthService,
    public userService: UserService,
    private articleService: ArticlePostService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
		private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getAuthUser();
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('username')) {
        this.getUser(paramMap.get('username'));
      }
    });


    if (this.user?._id != this.authService.getUserId()) {
			this.showButtons = true;
    }
  }

  getUser(username: string) {
		this.authService.findUserByUsername(username).subscribe((result) => {
			this.user = result;
			this.isFollowing(this.user?._id);
    });
    this.articleSubListener = this.articleService.articles$.subscribe(
      (result) => {
        this.articles = result.articles;
      }
    );
  }

  allLikedOrDisliked(item) {
    return {
      likers: item?.userLikedPosts?.filter((up) => up.type == 'like'),
      dislikers: item?.userLikedPosts?.filter((up) => up.type == 'dislike'),
    };
  }

  getBookmarks(): any[] {
    return this.user?.userLikedPosts.filter((ulp) => ulp.type === 'bookmark');
  }

  getAuthUser() {
    if (localStorage.getItem('userId')) {
      this.authService.findUserById(localStorage.getItem('userId'));
      this.userSubscription = this.authService.user$.subscribe((user) => {
        this.auth_user = user;
        this.cd.detectChanges();
        console.log('Change detection triggered!');
      });
    }
  }

  openAllLikedUsersDialog(users: { likers: any[]; dislikers: any[] }) {
    const dialogRef = this.dialog.open(UsersListComponent, {
      width: 'auto',
      height: '553px',
      data: { users },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => typeof res === 'object'))
      .subscribe((res) => {
        console.log('====================================');
        console.log('closed');
        console.log('====================================');
      });
  }

  truncateChar(text: string): string {
    let charlimit = 100;
    if (!text || text.length <= charlimit) {
      return text;
    }
    let without_html = text.replace(/<(?:.|\n)*?>/gm, '');
    let shortened =
      without_html.substring(0, charlimit) + '    Show more .............';
    return shortened;
  }

  onEditPost(post: any) {
    const dialogRef = this.dialog.open(AddEditPostComponent, {
      width: '100%',
      height: '44rem',
      data: { article: post },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => typeof res === 'object'))
      .subscribe((result) => {
        this.articleService.updateArticle(
          post._id,
          result?.title,
          result?.sub_title,
          result?.content,
          result?.article_image,
          result?.articleId
        );
      });
  }

  isFollowing(userId: number) {
      this.userService.isFollow(userId).subscribe((res) => {
        this.isFollowingProfileUser = res.isFollowing;
      });
  }

  onFollowUser(userId: number) {
		this.userService.followUser(userId).subscribe((res) => {
			if(res.success) {
				this.isFollowingProfileUser = true;
				this.snackBar.open(res.msg, "Success", {duration: 3000})
			}
		});
  }

	onUnfollowUser(userId: number) {
		this.userService.unfollowUser(userId).subscribe((res) => {
			if(res.success) {
				this.isFollowingProfileUser = false;
				this.snackBar.open(res.msg, "Success", {duration: 3000})
			}
		});
  }

  onDeleteArticle(id: number) {
    this.articleService.deleteArticle(id);
  }

  onHideArticle(id: string) {
    this.articleService.makePostHidden(id);
  }

  removeFromBookmarks(art: any) {
    this.articleService.removeFromBookmarks(art._id).subscribe((data) => {
      if (data.success) {
        // Find the index of the bookmark to remove in the original bookmarks array
        const index = this.user.userLikedPosts.findIndex(
          (ulp) => ulp.article._id === art._id && ulp.type === 'bookmark'
        );
        if (index !== -1) {
          // Remove the bookmark from the original array
          this.user.userLikedPosts.splice(index, 1);
        }
      }
    });
  }

  onLikeArticle(id) {
    this.articleService.likeArticle(id).subscribe((data) => {
      if (data.success) {
        this.getUser(this.user.username);
      }
    });
  }

  // onLikeArticle(id) {
  // 	this.articleService.onArticleAction(id, 'like')
  // }

  onDisLikeArticle(id) {
    this.articleService.dislikeArticle(id).subscribe((data) => {
      if (data.success) {
        this.getUser(this.user.username);
      }
    });
  }

	onDeleteComment(commentId: any, comments) {
    // Find the index of the comment in the array
    const index = comments.findIndex(c => c._id === commentId);
    if (index !== -1) {
      // Remove the comment from the array
      comments.splice(index, 1);
			this.cd.detectChanges()
    }
  }

  ngOnDestroy(): void {
    this.articleSubListener.unsubscribe();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
