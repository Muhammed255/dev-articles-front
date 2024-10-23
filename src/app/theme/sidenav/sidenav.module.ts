import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { SidenavComponent } from './sidenav.component';
import { VerticalMenuComponent } from '../vertical-menu/vertical-menu.component';
import { MaterialModule } from 'src/app/shared/material.module';

@NgModule({
  imports: [MaterialModule, FlexLayoutModule, VerticalMenuComponent],
  declarations: [SidenavComponent],
  exports: [SidenavComponent],
})
export class SidenavModule {}
