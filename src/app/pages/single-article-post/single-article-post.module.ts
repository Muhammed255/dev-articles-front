import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { ArticleCardModule } from '../components/article-card/article-card.module';
import { SearchModule } from '../search/search.module';
import { SingleArticlePostComponent } from './single-article-post.component';
import { CommentComponent } from '../components/comment/comment.component';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
	{path: "", component: SingleArticlePostComponent, pathMatch: 'full'}
]

@NgModule({
  imports: [
		ArticleCardModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		SearchModule,
		RouterModule.forChild(routes),
		CommentComponent,
		PipesModule
  ],
  declarations: [SingleArticlePostComponent],
  exports: [SingleArticlePostComponent],
})
export class SingleArticlePostModule { }
