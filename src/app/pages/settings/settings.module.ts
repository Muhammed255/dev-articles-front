import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { ArticleCardModule } from '../components/article-card/article-card.module';
import { SearchModule } from '../search/search.module';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
	{path: "", component: SettingsComponent, pathMatch: 'full'}
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
  declarations: [SettingsComponent],
  exports: [SettingsComponent],
})
export class SettingsModule { }
