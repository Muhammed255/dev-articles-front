import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArticlePostService } from 'src/app/services/article-post.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommentReplyService } from 'src/app/services/comment-reply.service';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-single-article-post',
  templateUrl: './single-article-post.component.html',
  styleUrls: ['./single-article-post.component.scss'],
})
export class SingleArticlePostComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  article: any;
  @ViewChild('commentsSection') commentsSection: ElementRef;
  topics: any[] = [];

  show_reply_box: boolean = false;
  auth_user: any;
  selectedIndex = -1;
  newComment = [];
  enabledComments = [];
  commentForm: FormGroup;
  commentReplyForm: FormGroup;
  searchForm: FormGroup;

  countLikes = 0;
  countdisLikes = 0;

  private userSubscription: Subscription;

  constructor(
    private articleService: ArticlePostService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private topicService: TopicService,
    private cd: ChangeDetectorRef,
    private commentService: CommentReplyService
  ) {}

  ngOnInit() {
    this.findArticle();
    this.createCommentForm();
    this.createCommentReplyForm();
    this.initSearchForm();
    this.getAuthUser();
  }

  ngAfterViewInit(): void {
    if (this.route.snapshot.fragment === 'commentsSection') {
      setTimeout(() => {
        this.commentsSection.nativeElement.scrollIntoView({
          behavior: 'smooth',
        });
      }, 2000);
    }
  }

  findArticle() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('articleId')) {
        return;
      }
      this.articleService
        .findOneArticle(paramMap.get('articleId'))
        .subscribe((data) => {
          if (data.success) {
            this.article = data.article;
            this.countArticleLikes(this.article._id);
            this.getTopics(this.article?.topicId._id);
          } else {
            this.snackBar.open(data.msg, 'Success', {
              duration: 5000,
            });
          }
        });
    });
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

  countArticleLikes(articleId) {
    this.articleService
      .getAllArticlesBy({ postId: articleId, type: 'like' })
      .subscribe((res) => {
        this.countLikes = res.articles.length;
      });
    this.articleService
      .getAllArticlesBy({ postId: articleId, type: 'dislike' })
      .subscribe((res) => {
        this.countdisLikes = res.articles.length;
      });
  }

  getTopics(topicId: string) {
    this.topicService.getOtherTopics(topicId).subscribe((res) => {
      if (res.success) {
        this.topics = res.topics;
      }
    });
  }

  toggle(evt, index) {
    this.selectedIndex = index;
  }

  // Create form for posting comments
  createCommentForm() {
    this.commentForm = this.fb.group({
      comment: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
    });
  }

  createCommentReplyForm() {
    this.commentReplyForm = this.fb.group({
      reply: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      commentId: [''],
    });
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      searchString: [''],
    });
  }

  onSubmitSearchForm() {
    this.router.navigate(['/account/wall'], {
      queryParams: { search: this.searchForm.get('searchString').value },
    });
  }

  // Enable the comment form
  enableCommentForm() {
    this.commentForm.get('comment').enable(); // Enable comment field
  }

  // Disable the comment form
  disableCommentForm() {
    this.commentForm.get('comment').disable(); // Disable comment field
  }

  // Function to post a new comment on blog post
  draftComment(id) {
    this.commentForm.reset(); // Reset the comment form each time users starts a new comment
    this.newComment = []; // Clear array so only one post can be commented on at a time
    this.newComment.push(id); // Add the post that is being commented on to the array
  }

  // Function to cancel new post transaction
  cancelSubmission(id) {
    const index = this.newComment.indexOf(id); // Check the index of the blog post in the array
    this.newComment.splice(index, 1); // Remove the id from the array to cancel post submission
    this.commentForm.reset(); // Reset  the form after cancellation
    this.enableCommentForm(); // Enable the form after cancellation
  }

  // Function to post a new comment
  postComment(id) {
    this.disableCommentForm(); // Disable form while saving comment to database
    const comment = this.commentForm.get('comment').value; // Get the comment value to pass to service function
    // Function to save the comment to the database
    this.commentService.commentArticle(id, comment);
    // .subscribe((data) => {
    //   this.article.comments.push(data.newComment)
    // 	this.findArticle()
    // 	this.cd.detectChanges();
    // });
    const index = this.newComment.indexOf(id); // Get the index of the blog id to remove from array
    this.newComment.splice(index, 1); // Remove id from the array
    this.enableCommentForm(); // Re-enable the form
    this.commentForm.reset(); // Reset the comment form
    if (this.enabledComments.indexOf(id) < 0) this.expand(id); // Expand comments for user on comment submission
  }

  postReplyComment() {
    const reply = this.commentReplyForm.get('reply').value;
    const commentId = this.commentReplyForm.get('commentId').value;
    this.commentService.postCommentReply(commentId, reply).subscribe((data) => {
      this.findArticle();
      this.commentReplyForm.reset();
    });
  }

  // Expand the list of comments
  expand(id) {
    this.enabledComments.push(id); // Add the current article id to array
  }

  // Collapse the list of comments
  collapse(id) {
    const index = this.enabledComments.indexOf(id); // Get position of id in array
    this.enabledComments.splice(index, 1); // Remove id from array
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
