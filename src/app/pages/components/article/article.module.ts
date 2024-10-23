import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/shared/material.module';
import { ArticleComponent } from './article.component';

@NgModule({
  imports: [
    CommonModule,
		MaterialModule,

  ],
  declarations: [ArticleComponent],
	exports: [ArticleComponent]
})
export class ArticleModule { }
