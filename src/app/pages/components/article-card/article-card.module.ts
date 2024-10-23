import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { ArticleCardComponent } from './article-card.component';
import { CommentComponent } from '../comment/comment.component';

@NgModule({
  imports: [
    CommonModule,
		RouterModule,
		MaterialModule,
		CommentComponent
  ],
  declarations: [ArticleCardComponent],
	exports: [ArticleCardComponent]
})
export class ArticleCardModule { }
