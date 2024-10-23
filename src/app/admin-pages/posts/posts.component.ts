import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { ArticlePostService } from 'src/app/services/article-post.service';
import { AuthService } from 'src/app/services/auth.service';
import { AddEditPostComponent } from '../add-edit-post/add-edit-post.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit, OnDestroy {
  articles: any[] = [];
  articleSubListener: Subscription;
  defaultImage = 'assets/faces/face-0.jpg';
  userSubscription: Subscription;

  auth_user: any;
  constructor(
    private articleService: ArticlePostService,
    private authService: AuthService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
		private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (localStorage.getItem('userId')) {
      this.authService.findUserById(localStorage.getItem('userId'));
      this.userSubscription = this.authService.user$.subscribe((user) => {
        this.auth_user = user;
				this.cd.detectChanges()
      });
    }
    this.getArticles();
  }

  getArticles() {
    this.articleService.getSpceficAdminArticles(this.auth_user._id);

    this.articleSubListener = this.articleService
      .getArticlesStatusListener()
      .subscribe((result) => {
        this.articles = result.articles;
      });
  }

  editPostDialog(post: any) {
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

  onDeleteArticle(id: number) {
    this.articleService.deleteArticle(id);
  }

  ngOnDestroy() {
    if (this.articleSubListener) this.articleSubListener.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }
}
