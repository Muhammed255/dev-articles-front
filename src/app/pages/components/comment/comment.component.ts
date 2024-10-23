import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { CommentReplyService } from 'src/app/services/comment-reply.service';
import { MaterialModule } from 'src/app/shared/material.module';
import { ReplyComponent } from '../reply/reply.component';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    PipesModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
		ReplyComponent
  ],
})
export class CommentComponent implements OnInit, OnChanges {
  comments: any[];
  @Input() articleId?: number;
  @Input() slice_amount: number = 0;
  @Input() authUser: any;
  selectedReplyIndex = -1;
  isAddingReply = false;

  isSelectedIndex = -1;
  isLoading = false;

  @Output() commentDeleted: EventEmitter<any> = new EventEmitter();

  isEditing: boolean = false;
  commentText: string = '';
  latestCommentsSlice: any[];
  commentReplyForm: FormGroup;

  constructor(
    private commentService: CommentReplyService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createCommentReplyForm();
    if (this.articleId) {
      this.getLatestComments();
    } else {
      this.comments = this.authUser?.comments;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cd.detectChanges();
  }

  createCommentReplyForm() {
    this.commentReplyForm = new FormGroup({
      reply: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(500),
        ])
      ),
      commentId: new FormControl(''),
      articleId: new FormControl(''),
    });
  }

  postReplyComment() {
    const reply = this.commentReplyForm.get('reply').value;
    const commentId = this.commentReplyForm.get('commentId').value;
    this.commentService.postCommentReply(commentId, reply).subscribe((_) => {
      this.cd.detectChanges();
      this.commentReplyForm.reset();
    });
  }

  toggle(evt, index) {
    this.selectedReplyIndex = index;
    this.isAddingReply = !this.isAddingReply;
  }

  cancelReply() {
    this.isAddingReply = false;
  }

  sliceReplies(comment) {
    let replies = comment.replies;
    if (replies && replies.length > 0 && this.slice_amount > 0) {
      replies = replies.slice(0, this.slice_amount);
    }
    return replies;
  }

  toggleEdit(index, commentTxt) {
    this.isSelectedIndex = index;
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.commentText = commentTxt; // Store the current comment text for editing
    }
  }

  updateComment(commentId) {
    this.isLoading = true;
    // Implement logic to save the edited comment
    this.commentService.editComment(commentId, this.commentText);
    // .subscribe((res) => {
    //   if (res.success) {
    //     const index = this.comments.findIndex((c) => c._id === commentId);
    //     this.comments[index] = res.updatedComment;
    //     this.isLoading = false;
    //     this.isEditing = false;
    //     this.commentText = '';
    //     this.snackBar.open(res.msg, 'Success', { duration: 3000 });
    //     this.cd.detectChanges();
    //   }
    // });
  }

  getLatestComments() {
    this.isLoading = true;
    this.commentService.getArticleLatestComments(this.articleId);
    this.commentService.getComments().subscribe((comments) => {
      this.comments = comments;
      this.isLoading = false;
      this.cd.detectChanges();
    });
    // })
    // .getArticleLatestComments(this.articleId, this.slice_amount)
    // .subscribe((data) => {
    //   this.comments = data.comments;
    //   console.log('====================================');
    //   console.log('comments', this.comments);
    //   console.log('====================================');
    // });
  }

  cancelEdit() {
    // Reset the comment text and exit edit mode
    this.commentText = '';
    this.isEditing = false;
  }

  deleteComment(commentId: number) {
    this.isLoading = true;
    this.commentService.removeComment(commentId);
    // .subscribe(
    //   (res) => {
    //     if (res.success) {
    //       const index = this.comments.findIndex((c) => c._id === commentId);
    //       if (index !== -1) {
    //         this.comments.splice(index, 1);
    //         this.comments.slice(this.slice_amount ?? 0);

    //         if (this.comments.length > this.slice_amount) {
    //           this.latestCommentsSlice.push(this.comments[this.slice_amount]);
    //         }
    //         this.isLoading = false;
    //         this.cd.detectChanges();
    //       }

    //       this.snackBar.open(res.msg, 'Success', { duration: 3000 });
    //     }
    //   },
    //   (err) => console.log(err.error.msg)
    // );
  }
}
