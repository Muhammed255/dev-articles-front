import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CommentsListComponent } from '../comments-list/comments-list.component';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent implements OnInit, OnDestroy {
  @Input() article: any;
  @Input() auth_user: any;
  defaultImage = 'assets/faces/face-0.jpg';
	isAuth = false;
	authSubscription: Subscription;

	@Input() latestComments: any[]; // Assuming you receive latestComments from outside
	@Input() showLatestComments: boolean = false; // Flag to control visibility of latest comments section
	// @Input() disableLikeBtn: boolean = false; // Flag to control visibility of latest comments section
	// @Input() disbaleDislikeBtn: boolean = false; // Flag to control visibility of latest comments section
	@Input() showHideFromTimeLine: boolean = false; // Flag to control visibility of latest comments section
	@Input() showAddOrRemoveFromBookmark: boolean = false; // Flag to control visibility of latest comments section


	@Output() likeArticle: EventEmitter<number> = new EventEmitter<number>();
  @Output() dislikeArticle: EventEmitter<number> = new EventEmitter<number>();
  @Output() addOrRemoveBookmark: EventEmitter<any> = new EventEmitter<any>();
  @Output() editArticle: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteArticle: EventEmitter<number> = new EventEmitter<number>();
  @Output() hideArticle: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
		private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
		public authService: AuthService,
		private cd: ChangeDetectorRef
  ) {
		this.matIconRegistry
      .addSvgIcon(
        'thumb_up_outline',
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          '../../../../assets/icons/thumb-up-outline.svg'
        )
      )
      .addSvgIcon(
        'thumb_up_filled',
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          '../../../../assets/icons/thumb-up-filled.svg'
        )
      )
      .addSvgIcon(
        'thumb_down_outline',
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          '../../../../assets/icons/thumb-down-outline.svg'
        )
      )
      .addSvgIcon(
        'thumb_down_filled',
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          '../../../../assets/icons/thumb-down-filled.svg'
        )
      );
	}

	ngOnInit(): void {
		this.authSubscription = this.authService.getAuthStatusListener().subscribe(isAuth => {
			this.isAuth = isAuth;
			this.cd.detectChanges()
			console.log('====================================');
			console.log(isAuth);
			console.log('====================================');
		})
	}

  onDeleteArticle(id: number) {
    this.deleteArticle.emit(id);
  }

  onEditPost(article: any) {
    this.editArticle.emit(article);
  }

  checkIfArticleBookmarked(article: any): boolean {
    if (article && article.userLikedPosts && this.auth_user) {
      return article.userLikedPosts.some(
        (up) => up.userId === this.auth_user._id && up.type === 'bookmark'
      );
    }
    return false;
  }

  disableIfLiked(article: any): { isLiked: boolean, count: number } {
    let count = 0;
    if (article && article.userLikedPosts && this.auth_user) {
      count = article.userLikedPosts.filter((up) => up.type === 'like').length;
      return {
        isLiked: article.userLikedPosts.some(
          (up) => {return (up.user._id === this.auth_user._id && up.type === 'like')}
        ),
        count: count
      };
    }
    return { isLiked: false, count: count };
  }

  allLikedOrDisliked(article: any): { likers: any[], dislikers: any[] } {
    if (article && article.userLikedPosts) {
      return {
        likers: article.userLikedPosts.filter((up) => up.type === 'like'),
        dislikers: article.userLikedPosts.filter((up) => up.type === 'dislike')
      };
    }
    return { likers: [], dislikers: [] };
  }

  disableIfDisLiked(article: any): { isdisLiked: boolean, count: number } {
    let count = 0;
    if (article && article.userLikedPosts && this.auth_user) {
      count = article.userLikedPosts.filter((up) => up.type === 'dislike').length;
      return {
        isdisLiked: article.userLikedPosts.some(
          (up) => {return (up.user._id === this.auth_user._id && up.type === 'dislike')}
        ),
        count: count
      };
    }
    return { isdisLiked: false, count: count };
  }

  onLikeArticle(id: number) {
			this.likeArticle.emit(id);
  }

  onDislikeArticle(id: number) {
			this.dislikeArticle.emit(id);
  }

  onAddToBookmarksClicked(article: any) {
    if(this.showAddOrRemoveFromBookmark) {
			this.addOrRemoveBookmark.emit(article);
		}
  }

	onHideFromTimeline(articleId: number) {
		this.hideArticle.emit(articleId);
	}

  commentsFragment(articleId: number) {
		this.router.navigate(['/account/articles', articleId], {
      fragment: 'commentsSection',
    });
  }

	openCommentsDialog(comments: any[], articleId) {
		console.log('====================================');
		console.log("opendialog",this.article);
		console.log('====================================');

    const dialogRef = this.dialog.open(CommentsListComponent, {
      width: '36rem',
      height: '36rem',
      data: { comments, auth_user: this.auth_user, articleId },
    });
    dialogRef.afterClosed().subscribe((_) => {
      console.log('====================================');
      console.log('CLOSED');
      console.log('====================================');
    });
  }

	ngOnDestroy(): void {
		if(this.authSubscription)
			this.authSubscription.unsubscribe();
	}
}
