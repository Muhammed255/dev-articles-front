// pipes/pipes.module.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CreateDate } from './create-date.pipe';

@NgModule({
  declarations: [
    CreateDate
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CreateDate
  ]
})
export class PipesModule { }
