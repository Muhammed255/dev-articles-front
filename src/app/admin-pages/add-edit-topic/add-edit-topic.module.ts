import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MaterialModule } from 'src/app/shared/material.module';
import { AddEditTopicComponent } from './add-edit-topic.component';


const routes: Routes = [
  { path: '', component: AddEditTopicComponent, pathMatch: 'full' },
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
  declarations: [AddEditTopicComponent],
  exports: [AddEditTopicComponent],
})
export class AddEditTopicModule { }
