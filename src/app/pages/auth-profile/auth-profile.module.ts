import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { ArticleCardModule } from '../components/article-card/article-card.module';
import { ArticleModule } from '../components/article/article.module';
import { AuthProfileComponent } from './auth-profile.component';
import { CommentComponent } from '../components/comment/comment.component';
import { ContentHeaderComponent } from 'src/app/shared/content-header/content-header.component';

const routes: Routes = [
	{path: "", component: AuthProfileComponent, pathMatch: 'full'}
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
		MaterialModule,
		ContentHeaderComponent,
		CommentComponent,
		ArticleModule,
		ArticleCardModule
  ],
  declarations: [AuthProfileComponent],
  exports: [AuthProfileComponent],
})
export class AuthProfileModule { }
