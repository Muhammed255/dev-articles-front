import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TopicArticlesComponent } from './topic-articles.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{path: "", component: TopicArticlesComponent, pathMatch: 'full'}
]

@NgModule({
  imports: [
    CommonModule,
		RouterModule.forChild(routes)
  ],
  declarations: [TopicArticlesComponent]
})
export class TopicArticlesModule { }
