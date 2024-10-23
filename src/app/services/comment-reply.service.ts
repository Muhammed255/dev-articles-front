import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

const BACKEND_URL = environment.backendUrl + '/comment-reply/';

@Injectable({
  providedIn: 'root',
})
export class CommentReplyService {
  private commentsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    []
  );
  public comments$: Observable<any[]> = this.commentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getComments(): Observable<any[]> {
    // Implement logic to fetch comments from API/database
    // Return an observable of comments data
    return this.comments$;
  }

  commentArticle(id: number, comment: string) {
    const commentData = { id, comment };
    return this.http
      .post<{ success: boolean; msg: string; newComment: any }>(
        BACKEND_URL + 'add-comment',
        commentData
      )
      .subscribe((res) => {
        const updatedComments = [res.newComment, ...this.commentsSubject.value];
        this.commentsSubject.next(updatedComments);
      });
  }

  editComment(id: number, comment: string) {
    const commentData = { id, comment };
    return this.http
      .put<{
        success: boolean;
        msg: string;
        updatedComment: any;
      }>(BACKEND_URL + 'edit-comment', commentData)
      .subscribe((res) => {
        const comments = this.commentsSubject.value;
        const index = comments.findIndex((c) => c._id === id);
        if (index !== -1) {
          comments[index] = res.updatedComment;
          this.commentsSubject.next(comments);
        }
      });
  }

  removeComment(id: number) {
    return this.http
      .delete<{ success: boolean; msg: string }>(
        BACKEND_URL + 'remove-comment/' + id
      )
      .subscribe((res) => {
        const comments = this.commentsSubject.value.filter((c) => c._id !== id);
        this.commentsSubject.next(comments);
      });
  }

  getArticleLatestComments(articleId: number, limit?: number) {
    return this.http
      .post<{ success: boolean; msg: string; comments: any[] }>(
        BACKEND_URL + 'latest-comments/' + articleId,
        { limit: limit }
      )
      .subscribe((response) => {
        if (response.success) {
          this.commentsSubject.next(response.comments);
        }
      });
  }

  postCommentReply(commentId, reply) {
    const commentReplyData = {
      reply: reply,
      commentId: commentId,
    };
    return this.http
      .post<{ reply: any }>(BACKEND_URL + 'do-reply', commentReplyData)
      .pipe(
        tap((res) => {
          console.log('====================================');
          console.log('RES', res);
          console.log('====================================');
          const updatedComments = this.commentsSubject.value.map((comment) => {
            if (comment._id === commentId) {
              const updatedReplies = [
                {
                  id: res.reply._id,
                  createDateTime: res.reply.createDateTime,
                  comment: res.reply.comment,
                  replier: res.reply.replier,
                  reply: res.reply.reply,
                  lastChangedDateTime: res.reply.lastChangedDateTime,
                },
                ...comment.replies,
              ];
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          });
          this.commentsSubject.next(updatedComments);
        })
      );
  }

  editReply(replyId, reply) {
    const commentReplyData = {
      reply: reply,
      id: replyId,
    };
    return this.http
      .put<{ success: boolean; msg: string; updatedReply: any }>(
        BACKEND_URL + 'edit-reply',
        commentReplyData
      );
  }

  removeReply(id: number) {
    return this.http
      .delete<{ success: boolean; msg: string }>(
        BACKEND_URL + 'delete-reply/' + id
      )
      .pipe(
        tap((res) => {
          const updatedComments = this.commentsSubject.value.map((comment) => {
            const updatedReplies = comment.replies.filter(
              (reply) => reply._id !== id
            );
            return { ...comment, replies: updatedReplies };
          });
          this.commentsSubject.next(updatedComments);
        })
      );
  }
}
