import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AddEditPostComponent } from 'src/app/admin-pages/add-edit-post/add-edit-post.component';
import { ArticlePostService } from 'src/app/services/article-post.service';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { CommentsListComponent } from '../components/comments-list/comments-list.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit, AfterViewInit, OnDestroy {
  articles: any[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  auth_user: any;
	isLoading = false

  articles_count = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 50];
  pageIndex = 0;
  showFirstLastButtons = true;
  searchString = '';
  isSearch = false;

  postDateFrom: Date;
  postDateTo: Date;

  defaultImage = 'assets/faces/face-0.jpg';

  private userSubscription: Subscription;
  private articlesSubscription: Subscription;

  constructor(
    private articleService: ArticlePostService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private searchService: SearchService
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

  ngOnInit() {
		this.isLoading = true;
    this.route.queryParamMap.subscribe((params) => {
      if (params.has('search')) {
        const searchString = params.get('search');
        this.searchString = searchString;
        this.searchService.getPostDateFrom().subscribe((postDateFrom: Date) => {
          this.postDateFrom = postDateFrom;
        });

        this.searchService.getPostDateTo().subscribe((postDateTo: Date) => {
          this.postDateTo = postDateTo;
        });
        this.searchString = searchString;
        this.onSearchSubmitted({
          searchString,
          postDateFrom: this.postDateFrom,
          postDateTo: this.postDateTo,
        });
        this.articlesSubscription = this.articleService.articles$.subscribe(
          (res) => {
            this.articles = res.articles;
            this.articles_count = res.maxArticles;
						this.isLoading = false;
          }
        );
        // this.searchArticles(
        //   this.searchString,
        //   this.pageIndex * this.pageSize,
        //   this.pageSize,
        //   this.postDateFrom,
        //   this.postDateTo
        // );
      } else {
        this.getArticles(this.pageIndex * this.pageSize, this.pageSize);
        this.articlesSubscription = this.articleService.articles$.subscribe(
          (res) => {
            this.articles = res.articles;
            this.articles_count = res.maxArticles;
						this.isLoading = false;
          }
        );
      }
    });
    if (localStorage.getItem('userId')) {
      this.authService.findUserById(localStorage.getItem('userId'));
      this.userSubscription = this.authService.user$.subscribe((user) => {
        this.auth_user = user;
				this.isLoading = false;
        this.cd.detectChanges();
        console.log('Change detection triggered!');
      });
    }
    // this.getArticles(this.pageIndex * this.pageSize, this.pageSize);
  }

  onSearchSubmitted(searchParams: {
    searchString: string;
    postDateFrom?: Date;
    postDateTo?: Date;
  }) {
    this.searchString = searchParams.searchString;
    this.postDateFrom = searchParams.postDateFrom;
    this.postDateTo = searchParams.postDateTo;
    this.pageIndex = 0; // Reset pagination to the first page

    // Fetch articles based on search parameters using searchArticles method
    this.searchArticles(
      this.searchString,
      0, // Start from the first article
      this.pageSize, // Fetch articles based on the current page size
      this.postDateFrom,
      this.postDateTo
    );
  }

  ngAfterViewInit() {
    // You can now access paginator methods and properties here
    console.log('paginator', this.paginator);
    // Example: Set the initial page index
    this.paginator.pageIndex = this.pageIndex;
    // You may need to trigger change detection if the paginator is initialized asynchronously
    this.cd.detectChanges();
  }

  getArticles(skip?: number, take?: number) {
		this.isLoading = true;
    this.articleService.getArticles(skip, take).subscribe((data) => {
      if (data.success) {
        this.articles = data.articles;
        this.articles_count = data.maxArticles;
        this.updatePaginator(data.maxArticles);
        this.articleService
          .getPostSubListener()
          .next({ articles: data.articles, maxArticles: data.maxArticles });
				this.isLoading = false;
      }
    });
  }

  searchArticles(search, skip, take, postDateFrom?, postDateTo?) {
		this.isLoading = true;
    this.articleService
      .article_search(search, skip, take, postDateFrom, postDateTo)
      .subscribe((res) => {
        this.articles = res.articles;
        this.articles_count = res.totalCount;
        this.updatePaginator(res.totalCount);
        this.articleService
          .getPostSubListener()
          .next({ articles: res.articles, maxArticles: res.totalCount });
				this.isLoading = false;
      });
  }

  checkIfArticleBookmarked(item) {
    return item.userLikedPosts.some(
      (up) => up.userId == this.auth_user._id && up.type == 'bookmark'
    );
  }

  checkUserWithType(articleId, type) {
    let isExist = false;
    this.articleService
      .getAllArticlesBy({
        postId: articleId,
        type: type,
        userId: this.auth_user._id,
      })
      .subscribe((res) => {
        if (res.articles.length === 0) {
          isExist = true;
        } else {
          isExist = false;
        }
      });
    return isExist;
  }

  countArticleLikes(articleId, type) {
    let count = 0;
    this.articleService
      .getAllArticlesBy({ postId: articleId, type: type })
      .subscribe((res) => {
        count = res.articles.length;
      });
    return count;
  }

  getAllBy(articleId, type) {
    let articles = [];
    this.articleService
      .getAllArticlesBy({ postId: articleId, type: type })
      .subscribe((res) => {
        articles = res.articles;
      });
    return articles;
  }

  disableIfLiked(item) {
    return {
      isLiked: item.userLikedPosts.some(
        (up) => up.userId === this.auth_user._id && up.type == 'like'
      ),
      count: item.userLikedPosts.filter((up) => up.type === 'like').length,
    };
  }

  disableIfDisLiked(item) {
    return {
      isdisLiked: item.userLikedPosts.some(
        (up) => up.userId === this.auth_user._id && up.type == 'dislike'
      ),
      count: item.userLikedPosts.filter((up) => up.type === 'dislike').length,
    };
  }

  allLikedOrDisliked(item) {
    return {
      likers: item.userLikedPosts.filter((up) => up.type == 'like'),
      dislikers: item.userLikedPosts.filter((up) => up.type == 'dislike'),
    };
  }

  onLikeArticle(id) {
    this.articleService.likeArticle(id).subscribe((data) => {
      if (data.success) {
        this.getArticles(this.pageIndex * this.pageSize, this.pageSize);
      }
    });
  }

  onDisLikeArticle(id) {
    this.articleService.dislikeArticle(id).subscribe(
      (data) => {
        if (data.success) {
          this.getArticles(this.pageIndex * this.pageSize, this.pageSize);
        }
      },
      (error) => {
        this.snackBar.open(error.error.msg, 'Error', {
          duration: 3000,
        });
      }
    );
  }

  onAddToBookmarksClicked(art) {
    if (
      art?.userLikedPosts?.some(
        (up) => up.user._id == this.auth_user._id && up.type == 'bookmark'
      )
    ) {
      this.articleService.removeFromBookmarks(art._id).subscribe((data) => {
        if (data.success) {
          let index = art.userLikedPosts.some(
            (up) =>
              up.user._id == this.auth_user._id &&
              up.type == 'bookmark' &&
              up.postId == art._id
          );
          art.userLikedPosts.splice(index, 1);
          this.snackBar.open(data.msg, 'success', {
            duration: 3000,
          });
        }
      });
    } else {
      this.articleService.addToBookmarks(art._id).subscribe((data) => {
        if (data.success) {
          art.userLikedPosts.push({
            user: this.auth_user,
            postId: art._id,
            userId: this.auth_user._id,
            type: 'bookmark',
            article: art,
          });
          this.snackBar.open(data.msg, 'success', {
            duration: 3000,
          });
        }
      });
    }
  }

  commentsFragment(articleId: number) {
    this.router.navigate(['/account/articles', articleId], {
      fragment: 'commentsSection',
    });
  }

  handlePageEvent(event: PageEvent) {
    this.articles_count = event.length;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    const skip = event.pageIndex * event.pageSize;
    const take = event.pageSize;
    if (this.searchString) {
      this.searchArticles(
        this.searchString,
        skip,
        take,
        this.postDateFrom,
        this.postDateFrom
      );
    } else {
      this.getArticles(skip, take);
    }
  }

  updatePaginator(length) {
		this.isLoading = true;
    if (this.paginator) {
      this.paginator.length = length;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
			this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  openCommentsDialog(comments: any[]) {
    const dialogRef = this.dialog.open(CommentsListComponent, {
      width: '36rem',
      height: '36rem',
      data: { comments },
    });
    dialogRef.afterClosed().subscribe((_) => {
      console.log('====================================');
      console.log('CLOSED');
      console.log('====================================');
    });
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
				this.isLoading = true;
        this.articleService.updateArticle(
          post._id,
          result?.title,
          result?.sub_title,
          result?.content,
          result?.article_image,
          result?.articleId
        );
				this.isLoading = false;
      });
  }

  onDeleteArticle(id: number) {
		this.isLoading = true;
    this.articleService.deleteArticle(id);
		this.isLoading = false;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.articlesSubscription) {
      this.articlesSubscription.unsubscribe();
    }
  }
}
