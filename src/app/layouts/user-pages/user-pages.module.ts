import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { AuthProfileModule } from 'src/app/pages/auth-profile/auth-profile.module';
import { ArticleCardModule } from 'src/app/pages/components/article-card/article-card.module';
import { PostsModule } from 'src/app/pages/posts/posts.module';
import { SearchModule } from 'src/app/pages/search/search.module';
import { SingleArticlePostModule } from 'src/app/pages/single-article-post/single-article-post.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { AuthModule } from '../../pages/auth/auth.module';
import { UserPagesComponent } from './user-pages.component';
import { CommentComponent } from 'src/app/pages/components/comment/comment.component';
import { LogoComponent } from 'src/app/shared/logo/logo.component';

const routes: Routes = [
  {
    path: '',
    component: UserPagesComponent,
    children: [
      {
        path: 'wall',
        loadChildren: () =>
          import('../../pages/posts/posts.module').then((p) => p.PostsModule),
      },
      {
        path: 'home',
        loadChildren: () =>
          import('../../pages/posts/posts.module').then((p) => p.PostsModule),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        loadChildren: () =>
          import('../../pages/auth/auth.module').then((m) => m.AuthModule),
      },
      {
        path: 'articles/:articleId',
        loadChildren: () =>
          import(
            '../../pages/single-article-post/single-article-post.module'
          ).then((m) => m.SingleArticlePostModule),
      },
      {
        path: 'topic-articles/:topicId',
        loadChildren: () =>
          import(
            '../../pages/topic-articles/topic-articles.module'
          ).then((m) => m.TopicArticlesModule),
      },
      {
        path: ':username',
        loadChildren: () =>
          import('../../pages/auth-profile/auth-profile.module').then(
            (m) => m.AuthProfileModule
          ),
      },
      {
        path: ':username/settings',
        loadChildren: () =>
          import('../../pages/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AuthProfileModule,
    SearchModule,
    ArticleCardModule,
    CommentComponent,
    PostsModule,
    SingleArticlePostModule,
    AuthModule,
		LogoComponent
  ],
  declarations: [UserPagesComponent],
})
export class UserPagesModule {}
