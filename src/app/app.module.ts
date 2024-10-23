import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Overlay } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './Interceptors/auth-interceptor';
import { ErrorInterceptor } from './Interceptors/error-interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminAuthGuard, AuthGuard } from './guards/auth.guard';
import { CommentsListComponent } from './pages/components/comments-list/comments-list.component';
import { UsersListComponent } from './pages/components/users-list/users-list.component';
import { ErrorComponent } from './pages/error/error.component';
import { CreateDate } from './pipes/create-date.pipe';
import { PipesModule } from './pipes/pipes.module';
import { ArticlePostService } from './services/article-post.service';
import { AuthService } from './services/auth.service';
import { CategoryService } from './services/category.service';
import { MenuService } from './services/menu.service';
import { TopicService } from './services/topic.service';
import { MaterialModule } from './shared/material.module';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { CommentComponent } from './pages/components/comment/comment.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersListComponent,
    NotFoundComponent,
  ],
  imports: [
		BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommentComponent,
    PipesModule,
		ErrorComponent,
		CommentsListComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthGuard,
    AdminAuthGuard,
    ArticlePostService,
    AuthService,
    CategoryService,
    TopicService,
    Overlay,
    MenuService,
  ],
  bootstrap: [AppComponent],
  exports: [CreateDate, ],
})
export class AppModule {}
