import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MaterialModule } from 'src/app/shared/material.module';
import { CategoriesComponent } from './categories.component';

const routes: Routes = [
  { path: '', component: CategoriesComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    CommonModule,
		MaterialModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
		AngularEditorModule
  ],
  declarations: [CategoriesComponent],
  exports: [CategoriesComponent]
})
export class CategoriesModule { }
