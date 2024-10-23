import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DashboardComponent } from "./dashboard.component";
import { TilesComponent } from "./tiles/tiles.component";
import { MaterialModule } from "src/app/shared/material.module";
import { ContentHeaderComponent } from "src/app/shared/content-header/content-header.component";

export const routes: Routes = [
  { path: "", component: DashboardComponent, pathMatch: "full" },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MaterialModule,
		ContentHeaderComponent
  ],
  declarations: [DashboardComponent, TilesComponent],
})
export class DashboardModule {}
