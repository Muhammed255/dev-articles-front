import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { ArticleCardModule } from '../components/article-card/article-card.module';
import { SearchModule } from '../search/search.module';
import { PostsComponent } from './posts.component';

const routes: Routes = [
	{path: "", component: PostsComponent, pathMatch: 'full'}
]

@NgModule({
  imports: [
    CommonModule,
		ArticleCardModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		SearchModule,
		RouterModule.forChild(routes)
  ],
  declarations: [PostsComponent],
  exports: [PostsComponent],
})
export class PostsModule { }
