import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment.prod';

const BACKEND_URL = environment.backendUrl + '/articles/';

@Injectable({
  providedIn: 'root',
})
export class ArticlePostService {
  private postSubListener: BehaviorSubject<{
    articles: any[];
    maxArticles: number;
  }> = new BehaviorSubject<{ articles: any[]; maxArticles: number }>({
    articles: [],
    maxArticles: 0,
  });
  public articles$: Observable<{ articles: any[]; maxArticles: number }> =
    this.postSubListener.asObservable();
  // private postSubListener = new Subject<{ articles: any[] }>();
  private articles: any[] = [];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  getPostSubListener() {
    return this.postSubListener;
  }

  newPost(
    title: string,
    sub_title: string,
    content: string,
    article_image: File,
    topicId: number
  ) {
    const articleData = new FormData();
    articleData.append('title', title);
    articleData.append('sub_title', sub_title);
    articleData.append('content', content);
    articleData.append('article_image', article_image, title);
    articleData.append('topicId', topicId.toString());

    return this.http
      .post<{ success: boolean; msg: string; article: any }>(
        BACKEND_URL + 'add-post',
        articleData
      )
      .pipe(
        tap((res) => {
          if (res.success) {
            this.postSubListener.next({
              articles: [...this.postSubListener.value.articles, res.article],
              maxArticles: this.postSubListener.value.maxArticles + 1,
            });
            this.snackBar.open(res.msg, 'success', {
              duration: 5000,
            });
          }
        })
      );
  }

  getArticles(skip?: number, take?: number) {
    return this.http
      .get<{
        success: boolean;
        msg: string;
        articles: any[];
        maxArticles: number;
      }>(BACKEND_URL + `get-articles?skip=${skip}&take=${take}`)
      .pipe(
        tap((data) =>
          this.postSubListener.next({
            articles: data.articles,
            maxArticles: data.maxArticles,
          })
        )
      );
  }

  private fetchArticles(): Observable<{
    articles: any[];
    maxArticles: number;
  }> {
    return this.http
      .get<{
        success: boolean;
        msg: string;
        articles: any[];
        maxArticles: number;
      }>(BACKEND_URL + 'get-articles')
      .pipe(
        tap((res) => {
          if (res.success) {
            this.postSubListener.next({
              articles: res.articles,
              maxArticles: res.maxArticles,
            });
          }
        })
      );
  }

  getArticlesStatusListener() {
    return this.postSubListener.asObservable();
  }

  findOneArticle(id: string) {
    return this.http.get<{ success: boolean; msg: string; article: any }>(
      BACKEND_URL + id
    );
  }

  updateArticle(
    id: number,
    title: string,
    sub_title: string,
    content: string,
    article_image: File,
    topicId: number
  ) {
    let articleData: FormData | any;

    if (typeof article_image === 'object') {
      articleData = new FormData();
      articleData.append('title', title);
      articleData.append('sub_title', sub_title);
      articleData.append('content', content);
      articleData.append('article_image', article_image, title);
      articleData.append('topicId', topicId);
    } else {
      articleData = {
        id: id,
        title,
        sub_title,
        content,
        article_image,
        topicId,
      };
    }

    // return this.http.put<{ response: any }>(BACKEND_URL + id, articleData);
    this.http
      .put<{ success: boolean; msg: string; newArticle: any }>(
        BACKEND_URL + id,
        articleData
      )
      .subscribe((data) => {
        if (data.success) {
          const currentPosts = this.postSubListener.getValue().articles;
          const postIndex = currentPosts.findIndex((art) => art._id === id);
          if (postIndex !== -1) {
            const updatedPosts = [...currentPosts];
            updatedPosts[postIndex] = data.newArticle;
            this.postSubListener.next({
              articles: updatedPosts,
              maxArticles: updatedPosts.length,
            });
          }
          this.snackBar.open(data.msg, 'success', {
            duration: 5000,
          });
        }
      });
  }

  deleteArticle(id: number) {
    this.http
      .delete<{ success: boolean; msg: string }>(BACKEND_URL + id)
      .subscribe((data) => {
        if (data.success) {
          const currentPosts = this.postSubListener.getValue().articles;
          const postIndex = currentPosts.findIndex((art) => art._id === id);
          if (postIndex !== -1) {
            currentPosts.splice(postIndex, 1);
            const updatedPosts = [...currentPosts];
            this.postSubListener.next({
              articles: updatedPosts,
              maxArticles: updatedPosts.length,
            });
          }
          this.snackBar.open(data.msg, 'success', {
            duration: 5000,
          });
        }
      });
  }

  likeArticle(id) {
    return this.http.post<{ success: boolean; msg: string, updatedArticle: any }>(
      BACKEND_URL + 'like-article',
      {
        id,
      }
    );
  }

  dislikeArticle(id) {
    return this.http.post<{ success: boolean; msg: string, updatedArticle: any }>(
      BACKEND_URL + 'dislike-article',
      {
        id,
      }
    );
  }

  onArticleAction(
    id: number,
    action: 'like' | 'dislike',
  ) {
    let actionObservable: Observable<any>;

    if (action === 'like') {
      actionObservable = this.likeArticle(id);
    } else if (action === 'dislike') {
      actionObservable = this.dislikeArticle(id);
    }

    if (actionObservable) {
      actionObservable.subscribe(
        (data) => {
          if (data.success) {
            // Optionally emit an event or do something else upon success
            const currentPosts = this.postSubListener.getValue().articles;
            const postIndex = currentPosts.findIndex((art) => art._id === id);
            if (postIndex !== -1) {
              const updatedPosts = [...currentPosts];
              updatedPosts[postIndex] = data.updatedArticle;
              this.postSubListener.next({
                articles: updatedPosts,
                maxArticles: updatedPosts.length,
              });
            }
            this.snackBar.open(data.msg, 'success', {
              duration: 5000,
            });
          }
        },
        (error) => {
          this.snackBar.open(error.error.msg, 'Error', {
            duration: 3000,
          });
        }
      );
    }
  }

  addToBookmarks(id) {
    return this.http.post<{ success: boolean; msg: string }>(
      BACKEND_URL + 'add-to-bookmark',
      { postId: id }
    );
  }

  removeFromBookmarks(id: string) {
    return this.http.put<{ success: boolean; msg: string }>(
      BACKEND_URL + 'remove-from-bookmark',
      { postId: id }
    );
  }

  getSpceficAdminArticles(id) {
    this.http
      .get<{
        success: boolean;
        msg: string;
        articles: any[];
        maxArticles: number;
      }>(BACKEND_URL + 'admin-articles/' + id)
      .pipe(
        map((articleData) => {
          this.postSubListener.next({
            articles: articleData.articles,
            maxArticles: articleData.maxArticles,
          });
          return {
            articles: articleData.articles.map((art) => {
              return {
                id: art._id,
                title: art.title,
                sub_title: art.sub_title,
                content: art.content,
                article_image: art.article_image,
                topicId: art.topic,
                autherId: art.user,
                comments: art.comments,
                created: art.created_at,
                likedBy: art.userLikedPosts.filter((up) => up.type == 'like'),
                dislikedBy: art.userLikedPosts.filter(
                  (up) => up.type == 'dislike'
                ),
                likes: art.userLikedPosts.filter((up) => up.type == 'like')
                  .length,
                dislikes: art.userLikedPosts.filter(
                  (up) => up.type == 'dislike'
                ).length,
								user: art.user
              };
            }),
            maxArticles: articleData.maxArticles,
          };
        })
      )
      .subscribe((transformedArticles) => {
        this.postSubListener.next({
          articles: transformedArticles.articles,
          maxArticles: transformedArticles.maxArticles,
        });
      });
  }

  getSpceficUserArticles(id) {
    this.http
      .get<{
        success: boolean;
        msg: string;
        articles: any[];
        maxArticles: number;
      }>(BACKEND_URL + 'user-articles/' + id)
      .pipe(
        map((articleData) => {
          this.postSubListener.next({
            articles: articleData.articles,
            maxArticles: articleData.maxArticles,
          });
          return {
            articles: articleData.articles.map((art) => {
              return {
                id: art._id,
                title: art.title,
                sub_title: art.sub_title,
                content: art.content,
                article_image: art.article_image,
                topicId: art.topic,
                autherId: art.user,
                comments: art.comments,
                created: art.created_at,
                likedBy: art.userLikedPosts.filter((up) => up.type == 'like'),
                dislikedBy: art.userLikedPosts.filter(
                  (up) => up.type == 'dislike'
                ),
                likes: art.userLikedPosts.filter((up) => up.type == 'like')
                  .length,
                dislikes: art.userLikedPosts.filter(
                  (up) => up.type == 'dislike'
                ).length,
              };
            }),
            maxArticles: articleData.maxArticles,
          };
        })
      )
      .subscribe((transformedArticles) => {
        this.postSubListener.next({
          articles: transformedArticles.articles,
          maxArticles: transformedArticles.maxArticles,
        });
      });
  }

  getArticlesByTopic(topicId) {
    return this.http.get<{
      success: boolean;
      msg: string;
      articles: any[];
      topic: any;
    }>(BACKEND_URL + 'topic-articles/' + topicId);
  }

  article_search(
    searchString: any,
    skip: number,
    take: number,
    postDateFrom?: Date,
    postDateTo?: Date
  ) {
    return this.http.post<{ totalCount: number; articles: any[] }>(
      BACKEND_URL + `search-article/${skip}/${take}`,
      { searchString, postDateFrom, postDateTo }
    );
  }

  getUserArticlesByType(type: string) {
    return this.http.post<{ articles: any[] }>(
      BACKEND_URL + 'user-articles-by-type',
      { type }
    );
  }

  getAllArticlesBy(where: object) {
    return this.http.post<{ articles: any[] }>(BACKEND_URL + 'articles-by', {
      where,
    });
  }

  makePostHidden(id: string) {
    return this.http
      .put<{ success: boolean; msg: string }>(
        BACKEND_URL + 'make-article-hidden',
        { articleId: id }
      )
      .subscribe((res) => {
        if (res.success) {
          const currentPosts = this.postSubListener.getValue().articles;
          const postIndex = currentPosts.findIndex((art) => art._id === id);
          if (postIndex !== -1) {
            currentPosts.splice(postIndex, 1);
            const updatedPosts = [...currentPosts];
            this.postSubListener.next({
              articles: updatedPosts,
              maxArticles: updatedPosts.length,
            });
          }
          this.snackBar.open(res.msg, 'success', {
            duration: 5000,
          });
        }
      });
  }

  removePostHidden(id: string) {
    return this.http
      .put<{ success: boolean; msg: string }>(
        BACKEND_URL + 'remove-article-hidden',
        { articleId: id }
      )
      .subscribe((res) => {
        if (res.success) {
          const currentPosts = this.postSubListener.getValue().articles;
          const postIndex = currentPosts.findIndex((art) => art._id === id);
          if (postIndex !== -1) {
            currentPosts.splice(postIndex, 1);
            const updatedPosts = [...currentPosts];
            this.postSubListener.next({
              articles: updatedPosts,
              maxArticles: updatedPosts.length,
            });
          }
          this.snackBar.open(res.msg, 'success', {
            duration: 5000,
          });
        }
      });
  }
}
